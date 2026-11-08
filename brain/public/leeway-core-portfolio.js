/*
LEEWAY HEADER — DO NOT REMOVE
REGION: LEEWAY.RAPIDWEBDEV.CORE_PORTFOLIO
TAG: LEEWAY.RAPIDWEBDEV.CORE_PORTFOLIO_RECONCILIATION
5WH:
WHAT = Project and source-evidence classifier for the historical 17 and the current LeeWay engineering spine.
WHY = Prevent stale repo guesses, private source leaks, false runtime claims and repeated unrelated evidence.
WHO = Creator/Human Authority and outside RapidWebDev portfolio contributors.
WHERE = brain/public/leeway-core-portfolio.js in 4citeB4U/RapidWebDev.
WHEN = 2026-11-08.
HOW = Read a checked-in exact-name registry; preserve existing public project rows, add sanitized private/historical projections and link only explicit first-party sources.
LICENSE = No new license asserted.
*/
(function(root){
  'use strict';
  const url='/brain/public/leeway-core-reconciliation.v1.json';
  let catalog=null,loading=null;
  const canonicalName=x=>String(x||'').trim().toLowerCase();
  const publicSource=(url)=>{
    try{
      const u=new URL(String(url));
      return u.protocol==='https:'&&u.hostname==='github.com'&&/^\/4citeB4U\/[^/]+(?:\/|$)/.test(u.pathname)?u.href:null;
    }catch{return null;}
  };
  async function load(){
    if(catalog)return catalog;
    if(!loading)loading=fetch(url,{cache:'no-store'}).then(r=>{
      if(!r.ok)throw new Error('Core roster HTTP '+r.status);
      return r.json();
    }).then(value=>{
      if(value?.id!=='LEEWAY_RAPIDWEBDEV_CORE_RECONCILIATION_20261108'
        ||value?.historical17?.length!==17
        ||new Set(value.historical17.map(x=>canonicalName(x.name))).size!==17)throw new Error('Core roster identity or cardinality mismatch');
      catalog=value;
      return catalog;
    }).catch(e=>{loading=null;throw e;});
    return loading;
  }
  const describe=(entry,original)=>{
    const isPublic=entry.sourceState==='PUBLIC_SOURCE'||entry.verification==='PUBLIC_SOURCE_ONLY';
    const sourceUrl=isPublic?publicSource(entry.sourceUrl):null;
    const repositoryName=entry.name;
    const sourceState=entry.sourceState||entry.verification||'SOURCE_UNVERIFIED';
    const status=sourceState==='REPOSITORY_UNRESOLVED'
       ?'REPOSITORY UNRESOLVED'
       :sourceUrl?'SOURCE IDENTIFIED · RUNTIME UNVERIFIED'
       :'PRIVATE / NO PUBLIC SOURCE · RUNTIME UNVERIFIED';
    return {
      id:'repo::'+repositoryName,
      repo_name:sourceUrl?repositoryName:null,
      core_repo_name:repositoryName,
      label:original?.label||repositoryName.replace(/[-_]+/g,' '),
      summary:entry.why||original?.summary||'Part of the LeeWay engineering landscape.',
      group:entry.group||original?.group||'Other Projects',
      core_scope:entry.scope||'EXTENDED',
      core_priority:entry.corePriority||null,
      core_role:entry.role||'System component',
      core_provenance:'LEEWAY_CORE_RECONCILIATION_20261108',
      evidence_state:status,
      verification:entry.verification||'RUNTIME_NOT_VERIFIED_BY_PORTFOLIO',
      repo_url:sourceUrl,
      live_url:sourceUrl&&entry.configuredViewUrl?entry.configuredViewUrl:null, // Public configured preview is still not execution proof.
      default_branch:original?.default_branch||'main',
      kind:'project',
      language:original?.language||null,
      updated_at:original?.updated_at||null,
      size:original?.size||null
    };
  };
  function enrich(rows){
    if(!catalog)return rows||[];
    const map=new Map((rows||[]).filter(x=>x?.kind==='project'&&x.repo_name).map(x=>[canonicalName(x.repo_name),x]));
    const unkeyed=(rows||[]).filter(x=>x?.kind==='project'&&!x.repo_name);
    const order=[];
    for(const entry of catalog.historical17){
      const key=canonicalName(entry.name),existing=map.get(key);
      order.push(describe(entry,existing));
      map.delete(key);
    }
    const extended=catalog.additionalPublicSystemSummaries||[];
    const spines=new Map((catalog.currentStandardsRegistrySpine||[]).map(x=>[canonicalName(x.name),x]));
    for(const entry of extended){
      const key=canonicalName(entry.name);
      if(order.some(x=>canonicalName(x.core_repo_name)===key))continue;
      const existing=map.get(key);
      order.push(describe({...entry,scope:'EXTENDED',group:'Agentic Systems',corePriority:spines.get(key)?.status||null},existing));
      map.delete(key);
    }
    // Preserve the remaining public and historical projects; distinguish source from execution.
    const rest=[...map.values()].map(x=>({
      ...x,
      evidence_state:x.evidence_state==='LIVE'?'PUBLIC WEBSITE LINK · RUNTIME UNVERIFIED':x.evidence_state,
      core_scope:null
    }));
    const others=(rows||[]).filter(x=>x?.kind!=='project');
    return [...order,...rest,...unkeyed,...others];
  }
  function evidenceFor(project){
    if(project?.kind==='evidence')return [];
    const name=project?.core_repo_name||project?.repo_name;
    if(!name)return [];
    const link=publicSource(project?.repo_url);
    if(!link)return [];
    return [
      {id:'source::'+name,title:name+' — public repository source',type:'Source Code',url:link,claim:'SOURCE_VISIBLE_NOT_EXECUTION',relation:'exact-repository'},
      {id:'ci::'+name,title:name+' — workflow history (inspect run status)',type:'CI History',url:link+'/actions',claim:'CI_HISTORY_LINK_NOT_PASS',relation:'exact-repository'}
    ];
  }
  function tour(){
    if(!catalog)return [];
    const prefer=['LeeWay-Standards','Leeway-formula-live','Leeway-Runtime-Fabric','LeeWay-Agent-Skills','LEEWAY-DEVICE-BRIDGE','Machine-Consciousness','LeeWay-Continuum','LeeWay-Voice-Fabric','LeeWay-Digital-Workforce','RapidWebDev'];
    const all=[...catalog.historical17,...(catalog.additionalPublicSystemSummaries||[])];
    return prefer.map(name=>all.find(x=>canonicalName(x.name)===canonicalName(name))).filter(Boolean).map(x=>({
      repoName:x.name,
      title:x.role,
      narrative:x.why
    }));
  }
  function lookup(name){
    if(!catalog)return null;
    const key=canonicalName(name);
    return [...catalog.historical17,...(catalog.additionalPublicSystemSummaries||[])].find(x=>canonicalName(x.name)===key)||null;
  }
  root.LeeWayCorePortfolio=Object.freeze({load,enrich,evidenceFor,tour,lookup,status:()=>({loaded:!!catalog,source:url,records:catalog?.historical17?.length||0})});
})(globalThis);
