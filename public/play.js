(()=>{
  const gameKey = window.location.pathname.split('/')[2];
  if (gameKey.startsWith('__')){
    window.location.pathname ='/';
  }
  const script = document.createElement('script');
  script.src = `/games/${gameKey}.js`;
  script.type= 'module';
  script.defer = true;
  document.querySelector('head').appendChild(script);
})();
