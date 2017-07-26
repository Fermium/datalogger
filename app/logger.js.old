var low = require('lowdb'); //db .json
var db;
var dbfile= '';
const _ = require('lodash');
var running=false;
module.exports={
  createdb: function(file){
    try{
      dbfile = (file.endsWith('.json')) ? file : file+'.json' ;
      db = low(dbfile);
    }
    catch(e){
      console.log(e);
    }
  },
  existsdb : function(){
    return dbfile!=='';
  },
  initdb: function(name,date,model,manufacturer){
    db.defaults({ _data : [] , _session : '', _date : '',_model : '',_manufacturer : ''}).write();
    db.set('_session',name).write();
    db.set('_date',date).write();
    db.set('_model',model).write();
    db.set('_manufacturer',manufacturer).write();
  },
  write: function(data){
    dd = _.clone(data);
    db.get('_data').push(dd).write();
  },
  close: function(){
    db=null;
    dbfile='';
  },
  start: function(){
    running=true;
    return running;
  },
  stop: function(){
    running=false;
    return !running;
  },
  isrunning: function(){
    return running;
  },
  getdb : function(){
    if(dbfile!==''){
      return dbfile;
    }
  }
};
