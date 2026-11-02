const TZ='America/Sao_Paulo';
const TAB='Agenda';
const USERS={camila:'Camila',elaine:'Elaine',iramar:'Iramar'};

/* Execute uma única vez após cadastrar INITIAL_PASSWORD_CAMILA,
   INITIAL_PASSWORD_ELAINE e INITIAL_PASSWORD_IRAMAR nas propriedades do script.
   As senhas iniciais são convertidas em hashes com salt e apagadas das propriedades. */
function initializeAccess(){
  const p=PropertiesService.getScriptProperties();
  Object.keys(USERS).forEach(k=>{
    const prop='INITIAL_PASSWORD_'+k.toUpperCase();
    const password=p.getProperty(prop);
    if(!password||password.length<12)throw Error('Cadastre uma senha inicial de pelo menos 12 caracteres para '+USERS[k]+'.');
    const salt=Utilities.getUuid()+Utilities.getUuid();
    p.setProperty('LOGIN_SALT_'+k,salt);
    p.setProperty('LOGIN_HASH_'+k,passwordHash_(password,salt));
    p.deleteProperty(prop);
  });
  return 'Senhas iniciais configuradas. Compartilhe cada senha somente com sua respectiva usuária.';
}
function setup(){const p=PropertiesService.getScriptProperties();let id=p.getProperty('SPREADSHEET_ID'),ss;try{ss=id?SpreadsheetApp.openById(id):null}catch(e){}if(!ss){ss=SpreadsheetApp.create("D'ELAS — Agenda");p.setProperty('SPREADSHEET_ID',ss.getId())}let sh=ss.getSheetByName(TAB)||ss.insertSheet(TAB);if(!sh.getLastRow())sh.appendRow(['ID','Criado em','Cliente','WhatsApp','Serviço','Data','Início','Fim','Observações','Status','Responsável']);sh.setFrozenRows(1);return ss.getUrl()}
function doGet(){return HtmlService.createHtmlOutputFromFile('Index').setTitle("D'ELAS | Agenda").addMetaTag('viewport','width=device-width, initial-scale=1')}
function hash_(s){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8))}
function passwordHash_(password,salt){
  const key=Utilities.newBlob(String(password)).getBytes();
  const block=Utilities.newBlob(String(salt)).getBytes().concat([0,0,0,1]);
  let u=Utilities.computeHmacSha256Signature(block,key),out=u.slice();
  for(let i=1;i<12000;i++){u=Utilities.computeHmacSha256Signature(u,key);for(let j=0;j<out.length;j++)out[j]=out[j]^u[j]}
  return Utilities.base64Encode(out);
}
function equalHash_(a,b){if(!a||!b||a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
function login(username,password){
  const u=String(username||'').trim().toLowerCase();
  if(!Object.prototype.hasOwnProperty.call(USERS,u))throw Error('Usuário ou senha incorretos.');
  const p=PropertiesService.getScriptProperties(),salt=p.getProperty('LOGIN_SALT_'+u),stored=p.getProperty('LOGIN_HASH_'+u);
  if(!salt||!stored||!equalHash_(passwordHash_(String(password||''),salt),stored))throw Error('Usuário ou senha incorretos.');
  const token=Utilities.getUuid()+Utilities.getUuid();
  CacheService.getScriptCache().put('session_'+hash_(token),USERS[u],21600);
  return {user:USERS[u],session:token};
}
function userFor_(session){
  const token=String(session||'');
  const user=token?CacheService.getScriptCache().get('session_'+hash_(token)):null;
  if(!user)throw Error('Sessão expirada. Entre novamente.');
  return user;
}
function api(action,d,session){
  const user=userFor_(session);
  if(action==='list')return list_(d||{});
  if(action==='create')return create_(d||{},user);
  if(action==='edit')return edit_(d||{},user);
  if(action==='status')return status_(d||{},user);
  throw Error('Ação inválida.');
}
function sheet_(){let id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw Error('Execute setup() primeiro.');let s=SpreadsheetApp.openById(id).getSheetByName(TAB);if(!s)throw Error('Aba Agenda não encontrada.');return s}
function list_(f){return sheet_().getDataRange().getValues().slice(1).filter(r=>r[0]).map(r=>({id:String(r[0]),client:String(r[2]||''),phone:String(r[3]||''),service:String(r[4]||''),date:date_(r[5]),start:time_(r[6]),end:time_(r[7]),notes:String(r[8]||''),status:String(r[9]||''),owner:String(r[10]||'')})).filter(x=>(!f.date||x.date===f.date)&&(!f.q||[x.client,x.phone,x.service].join(' ').toLowerCase().includes(String(f.q).toLowerCase()))).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start))}
function create_(d,user){let lock=LockService.getScriptLock();lock.waitLock(20000);try{let date=String(d.date||''),start=String(d.start||''),end=String(d.end||''),client=String(d.client||'').trim(),phone=String(d.phone||'').trim(),service=String(d.service||'').trim();if(!client||!phone||!service||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(start)||!/^\d{2}:\d{2}$/.test(end))throw Error('Preencha cliente, WhatsApp, serviço, data e horários.');let parsed=new Date(date+'T12:00:00');if(isNaN(parsed.getTime())||Utilities.formatDate(parsed,TZ,'yyyy-MM-dd')!==date)throw Error('Data inválida.');let today=Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd');if(date<today)throw Error('Não é possível agendar em uma data passada.');let day=parsed.getDay(),a=min_(start),b=min_(end);if(day===0||day===1)throw Error('Atendimentos de terça a sábado.');if(a<540||b>1080||b<=a)throw Error('Horário permitido: 09h às 18h. O término deve ser após o início.');let sh=sheet_(),rows=sh.getDataRange().getValues().slice(1),conflict=rows.some(r=>r[0]&&date_(r[5])===date&&String(r[9])!=='Cancelado'&&a<min_(time_(r[7]))&&b>min_(time_(r[6])));if(conflict)throw Error('Este horário já está ocupado. Atualize a agenda.');sh.appendRow([Utilities.getUuid(),new Date(),client,phone,service,dateObj_(date),start,end,String(d.notes||''),'Pendente de confirmação',user]);return {ok:true}}finally{lock.releaseLock()}}

function edit_(d,user){let lock=LockService.getScriptLock();lock.waitLock(20000);try{
let id=String(d.id||''),date=String(d.date||''),start=String(d.start||''),end=String(d.end||''),client=String(d.client||'').trim(),phone=String(d.phone||'').trim(),service=String(d.service||'').trim();
if(!id||!client||!phone||!service||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(start)||!/^\d{2}:\d{2}$/.test(end))throw Error('Preencha cliente, WhatsApp, serviço, data e horários.');
let parsed=new Date(date+'T12:00:00');if(isNaN(parsed.getTime())||Utilities.formatDate(parsed,TZ,'yyyy-MM-dd')!==date)throw Error('Data inválida.');
let today=Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd');if(date<today)throw Error('Não é possível agendar em uma data passada.');
let day=parsed.getDay(),a=min_(start),b=min_(end);if(day===0||day===1)throw Error('Atendimentos de terça a sábado.');if(a<540||b>1080||b<=a)throw Error('Horário permitido: 09h às 18h. O término deve ser após o início.');
let sh=sheet_(),rows=sh.getDataRange().getValues(),row=-1;for(let i=1;i<rows.length;i++)if(String(rows[i][0])===id){row=i+1;break}if(row<0)throw Error('Agendamento não encontrado.');
let conflict=rows.slice(1).some(r=>r[0]&&String(r[0])!==id&&date_(r[5])===date&&String(r[9])!=='Cancelado'&&a<min_(time_(r[7]))&&b>min_(time_(r[6])));if(conflict)throw Error('Este horário já está ocupado. Atualize a agenda.');
let old=rows[row-1];sh.getRange(row,3,1,7).setValues([[client,phone,service,dateObj_(date),start,end,String(d.notes||'')]]);sh.getRange(row,11).setValue(user);return {ok:true}
}finally{lock.releaseLock()}}

function status_(d,user){let allowed=['Pendente de confirmação','Confirmado','Concluído','Cancelado'];if(!allowed.includes(d.status))throw Error('Situação inválida.');let sh=sheet_(),v=sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(String(v[i][0])===String(d.id)){sh.getRange(i+1,10,1,2).setValues([[d.status,user]]);return {ok:true}}throw Error('Agendamento não encontrado.')}
function min_(s){let p=String(s).split(':').map(Number);return p[0]*60+p[1]}
function dateObj_(s){let p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2],12)}
function date_(v){return v instanceof Date?Utilities.formatDate(v,TZ,'yyyy-MM-dd'):String(v||'').slice(0,10)}
function time_(v){if(v instanceof Date)return Utilities.formatDate(v,TZ,'HH:mm');if(typeof v==='number'){let n=Math.round(v*1440);return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}return String(v||'').slice(0,5)}