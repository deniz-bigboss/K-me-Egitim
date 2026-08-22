/* ===========================================================
   Küme Eğitim — Yönetim Paneli
   Kimlik dogrulama GitHub uzerinden. Token yalnizca kullanicinin
   tarayicisinda (localStorage) tutulur, hicbir yere gonderilmez.
   =========================================================== */
(function () {
  'use strict';

  var OWNER='deniz-bigboss', REPO='K-me-Egitim', BRANCH='main', API='https://api.github.com';
  var HABER_YOL='data/haberler.json', PROG_YOL='data/programlar.json', PROG_DIZIN='assets/img/program';
  var ANAHTAR='kume_admin_token';

  var SINIFLAR = [['sinif-9','9. Sınıf'],['sinif-10','10. Sınıf'],['sinif-11','11. Sınıf'],
                  ['sinif-12','12. Sınıf'],['mezun','Mezun Grubu']];

  var token=null, haberSha=null, progSha=null, gorselSha={};
  var veri={guncelleme:'',haberler:[]}, prog={guncelleme:'',programlar:{}}, duzenlenen=null;

  var $=function(id){return document.getElementById(id);};

  /* ---------- UTF-8 base64 ---------- */
  function b64enc(str){var b=new TextEncoder().encode(str),s='';b.forEach(function(x){s+=String.fromCharCode(x);});return btoa(s);}
  function b64dec(b){var s=atob(String(b).replace(/\s/g,''));return new TextDecoder().decode(Uint8Array.from(s,function(c){return c.charCodeAt(0);}));}
  function bytes64(buf){var b=new Uint8Array(buf),s='';for(var i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);return btoa(s);}

  function api(yol,opts){
    opts=opts||{};
    opts.headers=Object.assign({'Accept':'application/vnd.github+json',
      'Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'},opts.headers||{});
    return fetch(API+yol,opts);
  }

  function durum(msg,tip){
    var d=$('durum');
    d.className='mb-5 rounded-xl px-4 py-3 text-sm '+(
      tip==='hata'?'bg-red-50 text-red-700 border border-red-200':
      tip==='ok'?'bg-green-50 text-green-700 border border-green-200':
      'bg-slate-100 text-slate-700 border border-slate-200');
    d.textContent=msg; d.classList.remove('hidden');
    if(tip==='ok') setTimeout(function(){d.classList.add('hidden');},7000);
  }
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function bugun(){return new Date().toISOString().slice(0,10);}

  /* ---------- Dosya yaz (GitHub) ---------- */
  function dosyaYaz(yol, icerikB64, sha, mesaj){
    var govde={message:mesaj, content:icerikB64, branch:BRANCH};
    if(sha) govde.sha=sha;
    return api('/repos/'+OWNER+'/'+REPO+'/contents/'+yol,{method:'PUT',body:JSON.stringify(govde)})
      .then(function(r){
        if(r.status===409) throw new Error('Dosya bu arada değişmiş. Sayfayı yenileyip tekrar deneyin.');
        if(!r.ok) return r.json().then(function(j){throw new Error(j.message||'Kaydedilemedi.');});
        return r.json();
      });
  }

  /* ---------- Giris ---------- */
  function girisMesaj(m,hata){var p=$('giris-mesaj');p.textContent=m;p.className='text-sm mt-4 '+(hata?'text-red-600':'text-green-600');}

  function girisYap(t,sessiz){
    token=t;
    return api('/repos/'+OWNER+'/'+REPO).then(function(r){
      if(r.status===401) throw new Error('Anahtar geçersiz veya süresi dolmuş.');
      if(r.status===404) throw new Error('Bu anahtarın bu depoya erişimi yok. Repository access ayarını kontrol edin.');
      if(!r.ok) throw new Error('GitHub bağlantı hatası ('+r.status+').');
      return r.json();
    }).then(function(repo){
      if(!repo.permissions||!repo.permissions.push)
        throw new Error('Anahtarın yazma yetkisi yok. Permissions → Contents: Read and write olmalı.');
      return api('/user').then(function(r){return r.ok?r.json():{login:''};});
    }).then(function(u){
      $('kullanici').textContent=u.login?'@'+u.login:'';
      $('giris-ekrani').classList.add('hidden');
      $('panel').classList.remove('hidden');
      $('cikis').classList.remove('hidden');
      return Promise.all([haberleriYukle(), programlariYukle()]);
    }).catch(function(e){
      token=null; localStorage.removeItem(ANAHTAR);
      if(!sessiz) girisMesaj(e.message,true);
      throw e;
    });
  }

  /* ---------- HABERLER ---------- */
  function haberleriYukle(){
    return api('/repos/'+OWNER+'/'+REPO+'/contents/'+HABER_YOL+'?ref='+BRANCH).then(function(r){
      if(r.status===404){haberSha=null;veri={guncelleme:'',haberler:[]};return;}
      if(!r.ok) throw new Error('Haberler okunamadı ('+r.status+').');
      return r.json().then(function(j){
        haberSha=j.sha; veri=JSON.parse(b64dec(j.content));
        if(!Array.isArray(veri.haberler)) veri.haberler=[];
      });
    }).then(listeCiz).catch(function(e){durum(e.message,'hata');});
  }

  function haberKaydet(mesaj){
    veri.guncelleme=bugun();
    veri.haberler.sort(function(a,b){return String(b.tarih).localeCompare(String(a.tarih));});
    durum('Kaydediliyor…');
    return dosyaYaz(HABER_YOL, b64enc(JSON.stringify(veri,null,2)+'\n'), haberSha, mesaj)
      .then(function(j){haberSha=j.content.sha; durum('Kaydedildi. Site 1–2 dakika içinde güncellenecek.','ok'); listeCiz();})
      .catch(function(e){durum(e.message,'hata');});
  }

  function listeCiz(){
    var el=$('liste');
    if(!veri.haberler.length){
      el.innerHTML='<div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">Henüz haber yok. “Yeni Haber” ile ekleyin.</div>';return;
    }
    el.innerHTML=veri.haberler.map(function(h,i){
      return '<div class="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center gap-4">'+
        (h.gorsel?'<img src="'+esc(h.gorsel)+'" alt="" class="w-20 h-16 object-cover rounded-lg shrink-0" />':'')+
        '<div class="flex-1 min-w-[200px]">'+
          '<div class="flex items-center gap-2 text-xs mb-1">'+
            '<span class="font-bold uppercase text-accent-700 bg-accent-50 border border-accent-100 rounded-full px-2 py-0.5">'+esc(h.kategori||'Haber')+'</span>'+
            '<span class="text-slate-500">'+esc(h.tarih)+'</span></div>'+
          '<h3 class="font-bold text-brand-900">'+esc(h.baslik)+'</h3>'+
          '<p class="text-sm text-slate-500">'+esc(h.ozet)+'</p></div>'+
        '<div class="flex gap-2">'+
          '<button data-duzenle="'+i+'" class="bg-slate-200 hover:bg-slate-300 text-brand-900 font-semibold text-sm px-4 py-2 rounded-full transition">Düzenle</button>'+
          '<button data-sil="'+i+'" class="bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm px-4 py-2 rounded-full transition">Sil</button>'+
        '</div></div>';
    }).join('');
  }

  function formAc(idx){
    duzenlenen=(idx==null?null:idx);
    var h=duzenlenen==null?null:veri.haberler[duzenlenen];
    $('form-baslik').textContent=h?'Haberi Düzenle':'Yeni Haber';
    $('f-id').value=h?(h.id||''):''; $('f-baslik').value=h?(h.baslik||''):'';
    $('f-tarih').value=h?(h.tarih||''):bugun();
    $('f-kategori').value=h?(h.kategori||'Duyuru'):'Duyuru';
    $('f-gorsel').value=h?(h.gorsel||''):''; $('f-ozet').value=h?(h.ozet||''):'';
    $('f-icerik').value=h?(h.icerik||''):'';
    $('form-kutu').classList.remove('hidden');
    $('form-kutu').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function formKapat(){$('form-kutu').classList.add('hidden');duzenlenen=null;}

  function slug(s){
    return String(s).toLocaleLowerCase('tr').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g')
      .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'haber';
  }

  /* ---------- DERS PROGRAMLARI ---------- */
  function programlariYukle(){
    var p1=api('/repos/'+OWNER+'/'+REPO+'/contents/'+PROG_YOL+'?ref='+BRANCH).then(function(r){
      if(r.status===404){progSha=null;prog={guncelleme:'',programlar:{}};return;}
      if(!r.ok) throw new Error('Programlar okunamadı ('+r.status+').');
      return r.json().then(function(j){progSha=j.sha;prog=JSON.parse(b64dec(j.content));
        if(!prog.programlar) prog.programlar={};});
    });
    var p2=api('/repos/'+OWNER+'/'+REPO+'/contents/'+PROG_DIZIN+'?ref='+BRANCH).then(function(r){
      gorselSha={};
      if(!r.ok) return;
      return r.json().then(function(list){
        if(Array.isArray(list)) list.forEach(function(f){gorselSha[f.name]=f.sha;});
      });
    }).catch(function(){});
    return Promise.all([p1,p2]).then(programCiz).catch(function(e){durum(e.message,'hata');});
  }

  function programCiz(){
    $('program-listesi').innerHTML=SINIFLAR.map(function(s){
      var k=s[0], ad=s[1], p=prog.programlar[k]||{};
      var var_=!!p.gorsel;
      return '<div class="bg-white rounded-2xl border border-slate-200 p-5">'+
        '<div class="flex flex-wrap items-center gap-4">'+
          '<div class="flex-1 min-w-[180px]">'+
            '<h3 class="font-display font-bold text-lg text-brand-900">'+esc(ad)+'</h3>'+
            (var_?'<p class="text-sm text-green-700">Program yüklü'+(p.guncelleme?' · '+esc(p.guncelleme):'')+'</p>'
                 :'<p class="text-sm text-slate-500">Henüz program yüklenmedi</p>')+
          '</div>'+
          '<div class="flex flex-wrap gap-2 items-center">'+
            '<label class="bg-brand-900 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2 rounded-full transition cursor-pointer">'+
              (var_?'Değiştir':'Görsel Yükle')+
              '<input type="file" accept="image/png,image/jpeg" class="hidden" data-yukle="'+k+'" />'+
            '</label>'+
            (var_?'<button data-kaldir="'+k+'" class="bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm px-4 py-2 rounded-full transition">Kaldır</button>':'')+
          '</div>'+
        '</div>'+
        (var_?'<img src="'+esc(p.gorsel)+'?t='+Date.now()+'" alt="" loading="lazy" class="mt-4 w-full max-w-md rounded-xl border border-slate-200" />':'')+
        '</div>';
    }).join('');
  }

  /* Gorseli tarayicida kucult -> JPEG blob */
  function kucult(file, maxG, kalite){
    return new Promise(function(res,rej){
      var img=new Image(), url=URL.createObjectURL(file);
      img.onload=function(){
        URL.revokeObjectURL(url);
        var w=img.width,h=img.height;
        if(w>maxG){h=Math.round(h*maxG/w);w=maxG;}
        var c=document.createElement('canvas');c.width=w;c.height=h;
        var ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);
        c.toBlob(function(b){b?res(b):rej(new Error('Görsel dönüştürülemedi.'));},'image/jpeg',kalite);
      };
      img.onerror=function(){URL.revokeObjectURL(url);rej(new Error('Görsel okunamadı. JPG veya PNG seçin.'));};
      img.src=url;
    });
  }

  function programYukle(k, file){
    var ad=k+'.jpg', yol=PROG_DIZIN+'/'+ad;
    durum('Görsel hazırlanıyor…');
    kucult(file,1600,0.85)
      .then(function(blob){
        if(blob.size>4*1024*1024) throw new Error('Görsel çok büyük. Daha küçük bir dosya deneyin.');
        durum('Yükleniyor… (' + Math.round(blob.size/1024) + ' KB)');
        return blob.arrayBuffer();
      })
      .then(function(buf){
        return dosyaYaz(yol, bytes64(buf), gorselSha[ad], 'Ders programı yükle: '+k);
      })
      .then(function(j){
        gorselSha[ad]=j.content.sha;
        prog.programlar[k]={gorsel:yol, guncelleme:bugun()};
        prog.guncelleme=bugun();
        return dosyaYaz(PROG_YOL, b64enc(JSON.stringify(prog,null,2)+'\n'), progSha, 'Program kaydı güncelle: '+k);
      })
      .then(function(j){
        progSha=j.content.sha;
        durum('Ders programı yüklendi. Site 1–2 dakika içinde güncellenecek.','ok');
        programCiz();
      })
      .catch(function(e){durum(e.message,'hata');});
  }

  function programKaldir(k){
    var p=prog.programlar[k]||{};
    if(!confirm('Bu sınıfın ders programı sitede görünmeyecek. Kaldırılsın mı?')) return;
    prog.programlar[k]={gorsel:'',guncelleme:''};
    prog.guncelleme=bugun();
    durum('Kaldırılıyor…');
    dosyaYaz(PROG_YOL, b64enc(JSON.stringify(prog,null,2)+'\n'), progSha, 'Ders programı kaldır: '+k)
      .then(function(j){progSha=j.content.sha;durum('Kaldırıldı.','ok');programCiz();})
      .catch(function(e){durum(e.message,'hata');});
  }

  /* ---------- Olaylar ---------- */
  document.addEventListener('DOMContentLoaded',function(){
    var kayitli=localStorage.getItem(ANAHTAR);
    if(kayitli) girisYap(kayitli,true).catch(function(){});

    $('giris-btn').addEventListener('click',function(){
      var t=$('token').value.trim();
      if(!t) return girisMesaj('Lütfen anahtarınızı yapıştırın.',true);
      girisMesaj('Kontrol ediliyor…',false);
      girisYap(t,false).then(function(){
        if($('hatirla').checked) localStorage.setItem(ANAHTAR,t);
      }).catch(function(){});
    });
    $('token').addEventListener('keydown',function(e){if(e.key==='Enter')$('giris-btn').click();});
    $('cikis').addEventListener('click',function(){localStorage.removeItem(ANAHTAR);location.reload();});

    /* sekmeler */
    document.querySelectorAll('.sekme-btn').forEach(function(b){
      b.addEventListener('click',function(){
        var s=b.getAttribute('data-sekme');
        document.querySelectorAll('.sekme-btn').forEach(function(x){
          var aktif=x===b;
          x.className='sekme-btn px-5 py-3 font-bold border-b-2 '+
            (aktif?'border-brand-900 text-brand-900':'border-transparent text-slate-500 hover:text-brand-900');
        });
        $('sekme-haberler').classList.toggle('hidden',s!=='haberler');
        $('sekme-programlar').classList.toggle('hidden',s!=='programlar');
      });
    });

    $('yeni-btn').addEventListener('click',function(){formAc(null);});
    $('iptal-btn').addEventListener('click',formKapat);

    $('kaydet-btn').addEventListener('click',function(){
      var baslik=$('f-baslik').value.trim(), ozet=$('f-ozet').value.trim(), tarih=$('f-tarih').value;
      if(!baslik||!ozet||!tarih) return durum('Başlık, özet ve tarih zorunludur.','hata');
      var kayit={
        id:$('f-id').value.trim()||(slug(baslik)+'-'+tarih.replace(/-/g,'')),
        baslik:baslik, ozet:ozet, icerik:$('f-icerik').value.trim()||ozet,
        tarih:tarih, kategori:$('f-kategori').value, gorsel:$('f-gorsel').value
      };
      if(duzenlenen==null) veri.haberler.push(kayit); else veri.haberler[duzenlenen]=kayit;
      var vardi=duzenlenen!=null;
      formKapat();
      haberKaydet((vardi?'Haber güncelle: ':'Haber ekle: ')+baslik);
    });

    $('liste').addEventListener('click',function(e){
      var d=e.target.getAttribute('data-duzenle'), s=e.target.getAttribute('data-sil');
      if(d!==null) return formAc(parseInt(d,10));
      if(s!==null){
        var i=parseInt(s,10), h=veri.haberler[i];
        if(!confirm('"'+h.baslik+'" silinsin mi? Bu işlem geri alınamaz.')) return;
        veri.haberler.splice(i,1);
        haberKaydet('Haber sil: '+h.baslik);
      }
    });

    $('program-listesi').addEventListener('change',function(e){
      var k=e.target.getAttribute('data-yukle');
      if(k&&e.target.files&&e.target.files[0]){programYukle(k,e.target.files[0]);e.target.value='';}
    });
    $('program-listesi').addEventListener('click',function(e){
      var k=e.target.getAttribute('data-kaldir');
      if(k) programKaldir(k);
    });
  });
})();
