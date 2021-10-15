(()=>{
  const gameKey = window.location.pathname.split('/')[2];
  const script = document.createElement('script');
  script.src = `/games/${gameKey}.js`;
  script.type= 'module';
  document.querySelector('head').appendChild(script);
})();
