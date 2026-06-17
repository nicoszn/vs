from fastapi import FastAPI,HTTPException;from pydantic import BaseModel;from pathlib import Path;import threading,time,json,re,subprocess,uuid,urllib.parse,logging;from collections import defaultdict
B=Path(__file__).parent;C=B/"cookies.txt";T=B/"temp";T.mkdir(exist_ok=True);app=FastAPI(title="YTE");J={};L=threading.Lock();TTL=1800
def js(i,s,d=None,e=None):
 with L:J[i]={"state":s,"data":d or {},"error":e,"ts":time.time()}
def _p():
 while 1:
  time.sleep(300);c=time.time()-TTL
  with L:
   for k in [k for k,v in J.items() if v.get("ts",0)<c]:del J[k]
threading.Thread(target=_p,daemon=True).start()
def ts(s):s=round(s,3);h,rem=divmod(s,3600);m,sec=divmod(rem,60);return f"{int(h):02d}:{int(m):02d}:{sec:06.3f}"
def yb():c=["yt-dlp"];c+=["--cookies",str(C)] if C.exists() else [];return c
def ex(v):
 if not v.exists():return""
 l=[]
 with open(v,'r',encoding='utf-8') as f:
  for x in f:
   x=x.strip()
   if x and not('-->'in x or x.startswith('WEBVTT')or x.isdigit()):
    y=re.sub(r'<[^>]+>','',x)
    if y:l.append(y)
 return' '.join(l)
def gv(u):
 c=yb()+["--dump-json","--no-playlist",u];r=subprocess.run(c,capture_output=True,text=True,timeout=60)
 if r.returncode:raise RuntimeError(r.stderr.strip())
 return json.loads(r.stdout.strip())
def nf(m):
 f=m.get("formats",[]);rm=defaultdict(list);cp={"mp4":1,"m4a":2,"webm":3,"mkv":4,"avi":5,"mov":6};cc={"hevc":1,"h265":1,"avc1":2,"h264":2,"vp9":3,"av01":4,"vp8":5}
 for x in f:
  h=x.get("height")
  if not h and"p"in x.get("format_note",""):
   try:h=int(x.get("format_note","").replace("p",""))
   except:h=None
  if h is None or h<360:continue
  s=None
  if x.get("filesize"):s=round(x["filesize"]/(1024*1024),1)
  elif x.get("filesize_approx"):s=round(x["filesize_approx"]/(1024*1024),1)
  e=x.get("ext","").lower();vc=x.get("vcodec","").lower();c=vc.split('.')[0] if vc else"unknown";cs=cp.get(e,99);ccs=cc.get(c,99);hb=(x.get("vcodec")!="none"and x.get("acodec")!="none");rk=(cs,ccs,s if s is not None else 1e9,-10 if hb else 0);rm[h].append({"format_id":x["format_id"],"resolution":f"{h}p","ext":e,"size_mb":s,"rank":rk})
 u=[]
 for h,es in rm.items():
  es.sort(key=lambda a:a["rank"]);b=es[0];u.append({"format_id":b["format_id"],"resolution":b["resolution"],"ext":b["ext"],"size_mb":b["size_mb"]})
 u.sort(key=lambda a:int(a["resolution"].rstrip("p")),reverse=True);return u
def sw(j,u):
 try:
  tb=T/f"sub_{j}";c=yb()+["--skip-download","--write-auto-subs","--write-subs","--sub-langs","en","--sub-format","vtt","-o",str(tb),u];subprocess.run(c,capture_output=True,timeout=60);p=Path(str(tb)+".en.vtt");t=ex(p);p.unlink(missing_ok=True);js(j,"done",{"subtitle_text":t})
 except Exception as ex:logging.error(f"Subtitle worker failed for {u}",exc_info=True);js(j,"error",error="Subtitle extraction failed, please try again.")
class U(BaseModel):url:str
def ip(u):return"list="in u and"watch?v="not in u
def ic(u):return any(x in u for x in["/channel/","/user/","/c/","/@"]) and"watch?v="not in u
@app.post("/api/detect")
async def ad(r:U):
 u=r.url.strip();return{"is_playlist":ip(u),"is_channel":ic(u)}
@app.post("/api/playlist")
async def ap(r:U):
 try:
  c=yb()+["--flat-playlist","--dump-single-json","--no-warnings",r.url];s=subprocess.run(c,capture_output=True,text=True,timeout=120)
  if s.returncode:raise RuntimeError(s.stderr.strip())
  d=json.loads(s.stdout.strip());es=d.get("entries",[]);vs=[]
  for i,e in enumerate(es):
   vid=e.get("id") or e.get("url","").split("v=")[-1];vs.append({"index":i,"id":vid,"title":e.get("title")or e.get("webpage_url_basename")or f"Video {i+1}","thumbnail":e.get("thumbnail")or(f"https://i.ytimg.com/vi/{vid}/mqdefault.jpg"if vid else None),"duration_str":ts(e.get("duration")or0),"url":e.get("url")or e.get("webpage_url")or f"https://www.youtube.com/watch?v={vid}"})
  return{"playlist_title":d.get("title","Playlist"),"count":len(vs),"videos":vs}
 except Exception as e:logging.error(f"Playlist extraction failed: {r.url}",exc_info=True);raise HTTPException(400,"Unable to fetch playlist, please try again later.")
@app.post("/api/channel")
async def ac(r:U,tab:str="videos"):
 try:
  u=r.url.strip()
  for suf in["/videos","/shorts","/live","/playlists","/releases","/featured"]:
   if u.endswith(suf):u=u[:-len(suf)]
  u=u.rstrip("/");tu=u if tab=="featured"else f"{u}/{tab}";c=yb()+["--flat-playlist","--dump-single-json","--playlist-end","50","--no-warnings",tu];s=subprocess.run(c,capture_output=True,text=True,timeout=120)
  if s.returncode and tab!="featured":
   c=yb()+["--flat-playlist","--dump-single-json","--playlist-end","50","--no-warnings",u];s=subprocess.run(c,capture_output=True,text=True,timeout=120)
  if s.returncode:raise RuntimeError(s.stderr.strip())
  d=json.loads(s.stdout.strip());es=d.get("entries",[]);its=[]
  for i,e in enumerate(es):
   if not e:continue
   vid=e.get("id") or e.get("url","").split("v=")[-1];pl=e.get("_type")=="playlist"or"list="in e.get("url","")or"playlist?list="in e.get("url","");its.append({"index":i,"id":vid,"title":e.get("title")or f"Item {i+1}","thumbnail":e.get("thumbnail")or(f"https://i.ytimg.com/vi/{vid}/mqdefault.jpg"if vid else None),"duration_str":ts(e.get("duration")or0)if not pl else"Playlist","url":e.get("url")or e.get("webpage_url")or f"https://www.youtube.com/watch?v={vid}","is_playlist":pl})
  return{"channel_title":d.get("title")or"Channel Feed","channel_url":r.url.strip(),"tab":tab,"count":len(its),"items":its}
 except Exception as e:logging.error(f"Channel extraction failed: {r.url} (tab={tab})",exc_info=True);raise HTTPException(400,"Unable to fetch channel content, please try again later.")
@app.post("/api/formats")
async def af(r:U):
 try:
  m=gv(r.url);f=nf(m);jid=str(uuid.uuid4());js(jid,"running");threading.Thread(target=sw,args=(jid,r.url),daemon=True).start();return{"video_id":m.get("id"),"title":m.get("title"),"thumbnail":m.get("thumbnail"),"duration_str":ts(m.get("duration",0)),"formats":f,"subtitle_job_id":jid}
 except Exception as e:logging.error(f"Format extraction failed: {r.url}",exc_info=True);raise HTTPException(400,"Unable to get video formats, please try again later.")
@app.get("/api/stream")
async def sv(url:str,format_id:str):
 if not url.startswith(("http://","https://")):raise HTTPException(400,"Invalid URL")
 if not re.match(r'^[\w\+]+$',format_id):raise HTTPException(400,"Invalid format_id")
 try:
  c=yb()+["-f",format_id,"-o","-","--no-playlist",url];p=subprocess.Popen(c,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 except Exception as e:logging.error(f"Stream process start failed: {url} / {format_id}",exc_info=True);raise HTTPException(400,"Could not start stream, please try again later.")
 def g():
  while True:
   ch=p.stdout.read(8192)
   if not ch:break
   yield ch
 return StreamingResponse(g(),media_type="video/mp4",headers={"Content-Disposition":f"attachment; filename=video_{format_id}.mp4"})
@app.get("/api/job/{job_id}")
async def aj(job_id:str):
 with L:return dict(J.get(job_id,{"state":"not_found"}))
# Music endpoints
@app.get("/api/music/search")
async def ams(q:str,limit:int=10):
 if not q:raise HTTPException(400,"Search query is required")
 try:
  qq=f"{q} official audio";sq=f"ytsearch{limit}:{qq}";c=yb()+["--flat-playlist","--dump-single-json","--no-warnings",sq];s=subprocess.run(c,capture_output=True,text=True,timeout=120)
  if s.returncode:raise RuntimeError(s.stderr.strip())
  d=json.loads(s.stdout.strip());es=d.get("entries",[]);res=[]
  for i,e in enumerate(es):
   vid=e.get("id")or e.get("url","").split("v=")[-1];res.append({"id":vid,"title":e.get("title")or f"Music Track {i+1}","uploader":e.get("uploader")or e.get("channel")or"Unknown Artist","thumbnail":e.get("thumbnail")or(f"https://i.ytimg.com/vi/{vid}/mqdefault.jpg"if vid else None),"duration":e.get("duration")or0,"duration_str":ts(e.get("duration")or0),"url":f"https://www.youtube.com/watch?v={vid}"if vid else(e.get("url")or e.get("webpage_url"))})
  return{"results":res}
 except Exception as e:logging.error(f"Music search failed: q={q}",exc_info=True);raise HTTPException(400,"Music search failed, please try again later.")
@app.get("/api/music/preview")
async def amp(url:str):
 if not url.startswith(("http://","https://")):raise HTTPException(400,"Invalid URL")
 try:
  c=yb()+["-f","ba","--download-sections","*00:00-00:30","-o","-","--no-playlist",url];p=subprocess.Popen(c,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 except Exception as e:logging.error(f"Preview stream start failed: {url}",exc_info=True);raise HTTPException(400,"Could not start preview, please try again later.")
 def g():
  try:
   while True:
    ch=p.stdout.read(8192)
    if not ch:break
    yield ch
  finally:p.terminate();p.wait()
 return StreamingResponse(g(),media_type="audio/mp4")
@app.get("/api/music/download")
async def amd(url:str,format:str="mp3"):
 if not url.startswith(("http://","https://")):raise HTTPException(400,"Invalid URL")
 try:
  m=gv(url);t=m.get("title","audio_track");st=re.sub(r'[^\w\s-]','',t).strip().replace(' ','_')
 except Exception as e:logging.error(f"Metadata fetch for download failed: {url}",exc_info=True);st="audio_track"
 c=yb()
 if format.lower()=="mp3":c+=["-f","ba","-x","--audio-format","mp3","-o","-","--no-playlist",url];fn=f"{st}.mp3";mt="audio/mpeg"
 else:c+=["-f","ba","-o","-","--no-playlist",url];fn=f"{st}.m4a";mt="audio/mp4"
 try:p=subprocess.Popen(c,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 except Exception as e:logging.error(f"Download process start failed: {url}",exc_info=True);raise HTTPException(400,"Could not start download, please try again later.")
 def g():
  try:
   while True:
    ch=p.stdout.read(8192)
    if not ch:break
    yield ch
  finally:p.terminate();p.wait()
 return StreamingResponse(g(),media_type=mt,headers={"Content-Disposition":f"attachment; filename={fn}"})
@app.get("/api/music/artist/search")
async def amas(q:str,limit:int=5):
 if not q:raise HTTPException(400,"Artist search query is required")
 try:
  eq=urllib.parse.quote_plus(q);su=f"https://www.youtube.com/results?search_query={eq}&sp=EgIQAg%253D%253D";c=yb()+["--flat-playlist","--dump-single-json","--playlist-end",str(limit),"--no-warnings",su];s=subprocess.run(c,capture_output=True,text=True,timeout=120)
  if s.returncode:raise RuntimeError(s.stderr.strip())
  d=json.loads(s.stdout.strip());es=d.get("entries",[]);arts=[]
  for e in es:
   aid=e.get("id")
   if not aid:continue
   arts.append({"id":aid,"name":e.get("title")or"Unknown Artist","thumbnail":e.get("thumbnail")or f"https://i.ytimg.com/vi/{aid}/mqdefault.jpg","channel_url":e.get("url")or f"https://www.youtube.com/channel/{aid}"})
  return{"artists":arts}
 except Exception as e:logging.error(f"Artist search failed: q={q}",exc_info=True);raise HTTPException(400,"Artist search failed, please try again later.")
@app.get("/api/music/artist/page")
async def amap(url:str,limit:int=30):
 if not url.startswith(("http://","https://")):raise HTTPException(400,"Invalid artist URL")
 tu=url
 if any(x in url for x in["/channel/","/user/","/c/","@"]):
  parts=list(urllib.parse.urlparse(url));path=parts[2].rstrip("/")
  if not any(path.endswith(suf) for suf in["/videos","/releases","/shorts","/playlists","/featured"]):
   parts[2]=path+"/releases";tu=urllib.parse.urlunparse(parts)
 try:
  c=yb()+["--flat-playlist","--dump-single-json","--playlist-end",str(limit),"--no-warnings",tu];s=subprocess.run(c,capture_output=True,text=True,timeout=120)
  if s.returncode and "/releases"in tu:
   fu=tu.replace("/releases","/videos");c=yb()+["--flat-playlist","--dump-single-json","--playlist-end",str(limit),"--no-warnings",fu];s=subprocess.run(c,capture_output=True,text=True,timeout=120)
  if s.returncode:raise RuntimeError(s.stderr.strip())
  d=json.loads(s.stdout.strip());es=d.get("entries",[]);tr=[]
  for i,e in enumerate(es):
   if not e:continue
   tid=e.get("id")or e.get("url","").split("v=")[-1];tr.append({"index":i,"id":tid,"title":e.get("title")or f"Track {i+1}","thumbnail":e.get("thumbnail")or(f"https://i.ytimg.com/vi/{tid}/mqdefault.jpg"if tid else None),"duration_str":ts(e.get("duration")or0),"url":e.get("url")or e.get("webpage_url")or f"https://www.youtube.com/watch?v={tid}"})
  is_pure="/releases"in tu and s.returncode==0;dl="Official Studio Master Releases"if is_pure else"Latest Uploaded Releases"
  return{"artist_name":d.get("title")or"Artist Page","count":len(tr),"tracks":tr,"description":dl}
 except Exception as e:logging.error(f"Artist page fetch failed: {url}",exc_info=True);raise HTTPException(400,"Could not fetch artist releases, please try again later.")
@app.get("/api/music/link")
async def aml(url:str):
 if not url.startswith(("http://","https://")):raise HTTPException(400,"Invalid URL")
 try:
  is_pl="list="in url and"watch?v="not in url
  if is_pl:
   c=yb()+["--flat-playlist","--dump-single-json","--no-warnings",url];s=subprocess.run(c,capture_output=True,text=True,timeout=120)
   if s.returncode:raise RuntimeError(s.stderr.strip())
   d=json.loads(s.stdout.strip());es=d.get("entries",[]);res=[]
   for i,e in enumerate(es):
    if not e:continue
    vid=e.get("id")or e.get("url","").split("v=")[-1];res.append({"id":vid,"title":e.get("title")or f"Track {i+1}","uploader":e.get("uploader")or e.get("channel")or d.get("title")or"Unknown Artist","thumbnail":e.get("thumbnail")or(f"https://i.ytimg.com/vi/{vid}/mqdefault.jpg"if vid else None),"duration":e.get("duration")or0,"duration_str":ts(e.get("duration")or0),"url":f"https://www.youtube.com/watch?v={vid}"if vid else(e.get("url")or e.get("webpage_url"))})
   return{"results":res,"title":d.get("title","Album")}
  else:
   m=gv(url);vid=m.get("id");tr={"id":vid,"title":m.get("title")or"Unknown Track","uploader":m.get("uploader")or m.get("channel")or"Unknown Artist","thumbnail":m.get("thumbnail")or(f"https://i.ytimg.com/vi/{vid}/mqdefault.jpg"if vid else None),"duration":m.get("duration")or0,"duration_str":ts(m.get("duration")or0),"url":url};return{"results":[tr],"title":m.get("title","Track")}
 except Exception as e:logging.error(f"Music link processing failed: {url}",exc_info=True);raise HTTPException(400,"Could not process the music link, please try again later.")
