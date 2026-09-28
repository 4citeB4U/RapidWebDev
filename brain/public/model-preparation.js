/* Share in-flight preparation between page startup and conversation controls. */
(function(root){
 class LeeWayModelPreparation{
  constructor(){this.jobs=new Map();}
  run(name,load){
   if(this.jobs.has(name))return this.jobs.get(name);
   const promise=Promise.resolve().then(load).finally(()=>{if(this.jobs.get(name)===promise)this.jobs.delete(name);});
   this.jobs.set(name,promise);return promise;
  }
 }
 root.LeeWayModelPreparation=LeeWayModelPreparation;
})(globalThis);
