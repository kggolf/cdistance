var cookies_container = $('#cookies');
var cookies;

function initCookie(){
  if(getCookieLength()>0){
    cookies_container.html('');
  }
  for(i=getCookieLength()-1; i>-1; i--){
    cookies_container.append('<li><a href="#" class="search_address">'+$.cookie('address_'+i)+'</a></li>')
  }
}

function setCookie(name, value){
  $.cookie(name, value, { expires: 7 });
}

function getCookieLength(){
  cookies = document.cookie;
  return (cookies.length != 0) ? cookies.split('; ').length : cookies.length ;
}

function setAddressCookie(address){
  cookies = document.cookie;
  cookies = cookies.split('; ');

  var already = false;

  for(i=0; i<getCookieLength(); i++){
    if(address == $.cookie('address_'+i)){
      already = true;
      break;
    }
  }
  if(already == false){
    addressCookie = 'address_'+(parseInt(getCookieLength()));
    setCookie(addressCookie, address);
    if(getCookieLength()==0){
        cookies_container.html('');
        cookies_container.append('<li><a href="#" class="search_address">'+address+'</a></li>');
      }else{
        cookies_container.find('li:eq(0)').before('<li><a href="#" class="search_address">'+address+'</a></li>');
      }
  }
}