/*jshint esversion: 6*/
var low = require('lowdb'); //db .json
var db;
var dbfile= '';
const _ = require('lodash');
var running=false;

process.on('message',(data)=>{
  switch (data.action) {
    case 'createdb':
      if(!existsdb()){
        createdb(data.message.path);
        initdb(data.message.name,data.message.date,data.message.model,data.message.manufacturer);
      }
      break;
    case 'start':
      start();
      break;
    case 'stop':
      stop();
      break;
    case 'close':
      close();
      break;
    case 'write':
      if(existsdb())
        write(data.message);
      break;
  }
});

  function createdb (file){
    try{
      dbfile = (file.endsWith('.json')) ? file : file+'.json' ;
      db = low(dbfile);
    }
    catch(e){
      console.log(e);
    }
  }
   function existsdb (){
    return dbfile!=='';
  }
  function initdb(name,date,model,manufacturer){
    db.defaults({ _data : [] , _session : '', _date : '',_model : '',_manufacturer : ''}).write();
    db.set('_session',name).write();
    db.set('_date',date).write();
    db.set('_model',model).write();
    db.set('_manufacturer',manufacturer).write();
  }
  function write (data){
    dd = _.clone(data);
    db.get('_data').push(dd).write();
  }
  function close (){
    db=null;
    dbfile='';
  }
   function start(){
    running=true;
    process.send({action:'start',message:running});
    return running;
  }
   function stop(){
    running=false;
    process.send({action:'stop',message:running});
    return !running;
  }
   function isrunning(){
     process.send({action:'isrunning',message:running});
    return running;
  }
  function getdb (){
    if(dbfile!==''){
      process.send({action:'getdb',message:running});
    }
  }
