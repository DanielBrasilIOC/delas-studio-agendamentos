const TZ='America/Sao_Paulo';
const SHEETS={BOOKINGS:'Agendamentos',SERVICES:'Serviços',BLOCKS:'Bloqueios',AUDIT:'Auditoria'};
function setup(){
  const p=PropertiesService.getScriptProperties();let id=p.getProperty('SPREADSHEET_ID');
  let ss=id?SpreadsheetApp.openById(id):SpreadsheetApp.create("D'ELAS — Gestão de Agendamentos");
  p.setProperty('SPREADSHEET_ID',ss.getId());
  ensure_(ss,SHEETS.BOOKINGS,['ID','Criado em','Nome','WhatsApp','Serviço','Comprimento','Data','Início','Fim','Observações','Status','Criado por']);
  ensure_(ss,SHEETS.SERVICES,['Serviço','Preço (R$)','Tipo de preço','Duração (min)','Ativo']);
  ensure_(ss,SHEETS.BLOCKS,['Data','Início','Fim','Motivo','Criado por']);
  ensure_(ss,SHEETS.AUDIT,['Data/hora','Administrador','Ação','ID do agendamento','Detalhes']);
  seedServices_(ss);return {spreadsheetId:ss.getId(),url:ss.getUrl()};
}
function ensure_(ss,name,headers){let sh=ss.getSheetByName(name)||ss.insertSheet(name);if(sh.getLastRow()===0)sh.appendRow(headers);return sh;}
function seedServices_(ss){
 const sh=ss.getSheetByName(SHEETS.SERVICES);if(sh.getLastRow()>1)return;
 const rows=[['CORTE COM SECAGEM',80,'A partir de',60,true],['CORTE COM ESCOVA',120,'A partir de',75,true],['CORTE TRATAMENTO (com secagem)',170,'A partir de',90,true],['ESCOVA',70,'A partir de',45,true],['APLICAÇÃO DE TINTURA',90,'A partir de',90,true],['RETOQUE',70,'A partir de',90,true],['TINTURA COMPLETA',120,'A partir de',120,true],['TUBO EXTRA DE TINTA (unidade)',40,'Fixo',15,true],['PRANCHA',25,'A partir de',30,true],['BABYLISS',35,'A partir de',30,true],['PROGRESSIVA — CURTO',160,'Fixo',150,true],['PROGRESSIVA — MÉDIO',190,'Fixo',180,true],['PROGRESSIVA — LONGO',250,'Fixo',210,true],['PROGRESSIVA — adicional extra longo/volumoso',30,'Adicional',30,true],['MECHAS — CURTO',350,'Fixo',240,true],['MECHAS — MÉDIO',400,'Fixo',270,true],['MECHAS — LONGO',550,'Fixo',300,true],['MECHAS — adicional extra longo/volumoso',50,'Adicional',30,true],['MORENA ILUMINADA',300,'A partir de',240,true],['LINHA GOLD (Wella, L’Oréal, Sebastian e Aneethun)',150,'Fixo',90,true],['LINHA BRANCA',120,'Fixo',75,true],['CRONOGRAMA CAPILAR — 4 SESSÕES',430,'Fixo',60,true]];
 sh.getRange(2,1,rows.length,5).setValues(rows);
}
function doGet(e){
 const page=e&&e.parameter&&e.parameter.page;
 if(page==='admin')return HtmlService.createTemplateFromFile('Index').evaluate().setTitle("D'ELAS | Gestão").addMetaTag('viewport','width=device-width, initial-scale=1');
 return HtmlService.createHtmlOutput('<meta name="viewport" content="width=device-width,initial-scale=1"><h2>D\'ELAS Studio de Beleza</h2><p>Aplicação de agendamento ativa. <a href="?page=admin">Acessar gestão</a></p>');
}
function api(action,data,token){
 if(action==='catalog')return catalog_();
 if(action==='slots')return slots_(data.date,data.service);
 auth_(token);
 if(action==='list')return list_(data||{});
 if(action==='updateStatus')return updateStatus_(data);
 if(action==='createManual')return createBooking_(data,true);
 if(action==='block')return block_(data);
 if(action==='saveService')return saveService_(data);
 if(action==='deleteBlock')return deleteBlock_(data);
 throw new Error('Ação não reconhecida.');
}
function publicBooking(data){return createBooking_(data,false);}
function ss_(){const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw new Error('Execute setup() primeiro.');return SpreadsheetApp.openById(id);}
function auth_(token){const p=PropertiesService.getScriptProperties();if(!token||![p.getProperty('ADMIN_TOKEN_1'),p.getProperty('ADMIN_TOKEN_2')].includes(token))throw new Error('Acesso administrativo não autorizado.');}
function catalog_(){const sh=ss_().getSheetByName(SHEETS.SERVICES);return sh.getDataRange().getValues().slice(1).filter(r=>r[4]===true).map(r=>({name:r[0],price:r[1],priceType:r[2],duration:r[3]}));}
function slots_(date,service){
 if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Data inválida.');
 const d=new Date(date+'T12:00:00');const day=d.getDay();if(day===0||day===1) return [];
 const svc=catalog_().find(s=>s.name===service);if(!svc)throw new Error('Serviço inválido.');
 const sh=ss_().getSheetByName(SHEETS.BOOKINGS),rows=sh.getDataRange().getValues().slice(1);
 const blocks=ss_().getSheetByName(SHEETS.BLOCKS).getDataRange().getValues().slice(1);
 const out=[];for(let m=9*60;m<18*60;m+=30){let end=m+Number(svc.duration||30);if(end>18*60)continue;
  const start=strTime_(m),finish=strTime_(end);
  const busy=rows.some(r=>String(r[6])===date&&!['Cancelado'].includes(r[10])&&overlap_(start,finish,String(r[7]),String(r[8])));
  const blocked=blocks.some(r=>String(r[0])===date&&overlap_(start,finish,String(r[1]),String(r[2])));
  if(!busy&&!blocked)out.push(start);
 }return out;
}
function createBooking_(d,manual){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const date=String(d.date||'');const day=new Date(date+'T12:00:00').getDay();
  if(!d.name||!d.phone||!d.service||!/^\d{4}-\d{2}-\d{2}$/.test(date)||day===0||day===1)throw new Error('Confira os dados e escolha uma data de terça a sábado.');
  const svc=catalog_().find(s=>s.name===d.service);if(!svc)throw new Error('Serviço indisponível.');
  const start=String(d.time||'');if(!/^([0-1]\d|2[0-3]):[0-5]\d$/.test(start))throw new Error('Horário inválido.');
  const mins=Number(start.slice(0,2))*60+Number(start.slice(3));const end=mins+Number(svc.duration||30);
  if(mins<540||end>1080)throw new Error('Horário fora do expediente.');
  const finish=strTime_(end);const sh=ss_().getSheetByName(SHEETS.BOOKINGS);const rows=sh.getDataRange().getValues().slice(1);
  const conflict=rows.some(r=>String(r[6])===date&&!['Cancelado'].includes(r[10])&&overlap_(start,finish,String(r[7]),String(r[8])));
  const blocked=ss_().getSheetByName(SHEETS.BLOCKS).getDataRange().getValues().slice(1).some(r=>String(r[0])===date&&overlap_(start,finish,String(r[1]),String(r[2])));
  if(conflict||blocked)throw new Error('Este horário não está mais disponível. Escolha outro.');
  const id=Utilities.getUuid();const status=manual?'Confirmado':'Pendente de confirmação';
  sh.appendRow([id,new Date(),String(d.name).slice(0,100),String(d.phone).slice(0,25),d.service,d.length||'',date,start,finish,String(d.notes||'').slice(0,500),status,manual?'Admin':'Cliente']);
  audit_(manual?'Admin':'Cliente',manual?'Criação manual':'Novo pedido',id,status);
  return {ok:true,id,status};
 }finally{lock.releaseLock();}
}
function list_(filters){const sh=ss_().getSheetByName(SHEETS.BOOKINGS);const all=sh.getDataRange().getValues();return all.slice(1).map(r=>({id:r[0],created:r[1],name:r[2],phone:r[3],service:r[4],length:r[5],date:r[6],start:r[7],end:r[8],notes:r[9],status:r[10]})).filter(r=>(!filters.date||String(r.date)===filters.date)&&(!filters.status||r.status===filters.status)).sort((a,b)=>(String(a.date)+String(a.start)).localeCompare(String(b.date)+String(b.start)));}
function updateStatus_(d){const sh=ss_().getSheetByName(SHEETS.BOOKINGS),v=sh.getDataRange().getValues();const i=v.findIndex(r=>r[0]===d.id);if(i<1)throw new Error('Agendamento não encontrado.');const allowed=['Pendente de confirmação','Confirmado','Concluído','Cancelado','Não compareceu'];if(!allowed.includes(d.status))throw new Error('Status inválido.');sh.getRange(i+1,11).setValue(d.status);audit_('Admin','Alteração de status',d.id,d.status);return {ok:true};}
function saveService_(d){const sh=ss_().getSheetByName(SHEETS.SERVICES),v=sh.getDataRange().getValues();const i=v.findIndex((r,n)=>n>0&&r[0]===d.name);if(i<1)throw new Error('Serviço não encontrado.');sh.getRange(i+1,2,1,4).setValues([[Number(d.price),d.priceType,Number(d.duration),d.active===true]]);audit_('Admin','Edição de serviço',d.name,'Preço/duração/ativo');return {ok:true};}
function block_(d){const lock=LockService.getScriptLock();lock.waitLock(20000);try{if(!d.date||!d.start||!d.end||d.start>=d.end)throw new Error('Informe um intervalo válido.');const sh=ss_().getSheetByName(SHEETS.BOOKINGS);const busy=sh.getDataRange().getValues().slice(1).some(r=>String(r[6])===d.date&&!['Cancelado'].includes(r[10])&&overlap_(d.start,d.end,String(r[7]),String(r[8])));if(busy)throw new Error('Já existe agendamento nesse intervalo.');ss_().getSheetByName(SHEETS.BLOCKS).appendRow([d.date,d.start,d.end,d.reason||'', 'Admin']);audit_('Admin','Bloqueio de horário',d.date,d.start+'-'+d.end);return {ok:true};}finally{lock.releaseLock();}}
function deleteBlock_(d){const sh=ss_().getSheetByName(SHEETS.BLOCKS),v=sh.getDataRange().getValues();const i=v.findIndex((r,n)=>n>0&&String(r[0])===d.date&&String(r[1])===d.start);if(i<1)throw new Error('Bloqueio não encontrado.');sh.deleteRow(i+1);audit_('Admin','Remoção de bloqueio',d.date,d.start);return {ok:true};}
function audit_(who,action,id,detail){ss_().getSheetByName(SHEETS.AUDIT).appendRow([new Date(),who,action,id,detail]);}
function overlap_(a,b,c,d){return a<d&&c<b;}
function strTime_(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
