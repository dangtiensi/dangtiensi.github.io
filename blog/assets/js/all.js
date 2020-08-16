const $siben = {};
$siben.result = 10;
$siben.domain = () =>
{
	let domain = document.location;
	return domain.protocol + '//' + domain.host;
};
$siben.isNumber = (int) =>
{
	let num = parseInt(int);
	return isNaN(num) ? null : num;
};
$siben.getParam = (key) =>
{
	let val = (new URL(document.location)).searchParams.get(key);
	return val ? val : null;
};
$siben.formatDate = (str) =>
{
	return encodeURIComponent(str.substring(0, 19) + str.substring(23, 29));
};
$siben.isJSON = (text) =>
{
	try{
   		return (JSON.parse(text) && !!text);
    }catch (e){
        return false;
    }
};
$siben.getJSON = (url = null) =>
{
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();
	if($siben.isJSON(xhr.responseText) === true && xhr.status === 200)
    	return JSON.parse(xhr.responseText);
	return null;
}
$siben.callbackJSON = (url = null, callback = (data) => {}) =>
{
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.onload = function()
	{
        if($siben.isJSON(xhr.responseText) === true && xhr.status === 200)
            callback(JSON.parse(xhr.responseText));
		else
			console.log(xhr.status);
	}
    xhr.send();
}
$siben.isRedirect = false;
$siben.getPage = (url = null) =>
{
	$siben.isRedirect = true;
	$siben.callbackJSON(url, (data) =>
	{
        if(data.feed.entry[0] == undefined)
            document.location.href = '/';
        let index = data.feed.openSearch$startIndex.$t,
		time = $siben.formatDate(data.feed.entry[0].published.$t),
		page = Math.ceil(index/$siben.result)+1, start = (page-1)*$siben.result;
        if(blog.category)
            document.location.href = '/search/label/' + blog.category + '?updated-max=' + time + '&start=' + start + '&page=' + page;
        else if(blog.search)
            document.location.href = '/search?q=' + blog.search + '&updated-max=' + time + '&start=' + start + '&page=' + page;
        else
			document.location.href = '/search?updated-max=' + time + '&start=' + start + '&page=' + page;
	});
};
$siben.redirect = (page = 1) =>
{
	if($siben.isRedirect === true)
		return false;
	let start = (page-1)*$siben.result;
	if(blog.category)
	{
      if(page <= 1 && $siben.isNumber(page))
          document.location.href = '/search/label/'+blog.category;
      else
          $siben.getPage('/feeds/posts/summary?category=' + blog.category + '&start-index=' + start + '&max-results=1&alt=json');
	}else if(blog.search)
	{
      if(page <= 1 && $siben.isNumber(page))
          document.location.href = '/search?q='+blog.search;
      else
          $siben.getPage('/feeds/posts/summary?q=' + blog.search + '&start-index=' + start + '&max-results=1&alt=json');
	}else{
      if(page <= 1 && $siben.isNumber(page))
          document.location.href = '/';
      else
          $siben.getPage('/feeds/posts/summary?start-index=' + start + '&max-results=1&alt=json');
	}
};
$siben.getPagination = (url = null) =>
{
	$siben.callbackJSON(url, (data) =>
	{
        const html = document.getElementById('pagination'), limit = 2;
        let current = $siben.isNumber($siben.getParam('page')), total = Math.ceil(data.feed.openSearch$totalResults.$t/$siben.result);
        current = (current === null || current === '' || current <= 0 || current > total) ? 1 : current;
        let start = (current - limit < 1 ? 1 : current - limit), end = (current + limit > total ? total : current + limit);
        if(current > 1)
        {
            html.innerHTML += '<a class="page" onclick="$siben.redirect(1)">«</a>';
            html.innerHTML += '<a class="page" onclick="$siben.redirect(' + (current-1) + ')">‹</a>';
        }
        if(current > 3)
            html.innerHTML += '<a class="point">...</a>';
        for(start; start <= end; start++)
            html.innerHTML += (current === start ? '<a class="page current">' + current + '</a>' : '<a class="page" onclick="$siben.redirect(' + start + ')">' + start + '</a>');
        if(current < total - limit)
            html.innerHTML += '<a class="point">...</a>';
        if(current < total)
        {
            html.innerHTML += '<a class="page" onclick="$siben.redirect(' + (current+1) + ')">›</a>';
            html.innerHTML += '<a class="page" onclick="$siben.redirect(' + total + ')">»</a>';
        }
	});
};
$siben.viewElement = (el = undefined) =>
{
    let check = el.getBoundingClientRect();
    return (check.top >= 0 && check.left >= 0 && check.top <= window.innerHeight);
};
$siben.loadImage = (url = null, callback = (url, el) => {}, el = undefined) =>
{
    let img = new Image();
    img.onload = () =>
	{
        callback(url, el);
    };
    img.src = url;
};
$siben.lazyImage = () =>
{
    const img = document.querySelectorAll('.thumnail>.image.lazy');
    if(!img) return false;
    img.forEach((item, index) =>
	{
        if($siben.viewElement(item))
		{
            setTimeout(() =>
			{
                $siben.loadImage(item.dataset.src, (url, el) =>
				{
                    el.setAttribute('style', 'background-image: url(\'' + url + '\')');
                    el.classList.remove('lazy');
                }, item);
            }, index * 10);
        }
    });
};
document.addEventListener("DOMContentLoaded", () =>
{
	$siben.lazyImage();
	document.addEventListener("scroll", () => $siben.lazyImage());
	document.addEventListener("resize", () => $siben.lazyImage());
	document.addEventListener("orientationchange", () => $siben.lazyImage());
});
console.log(`%cPowered by Sĩ Ben Đẹp Trai 😎 => Facebook: https://fb.com/profile.php?id=1536501797`, 'font-size: 12px');
