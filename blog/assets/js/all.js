const siben = {};
siben.domain = () =>
{
	let domain = document.location;
	return domain.protocol + '//' + domain.host;
};
siben.isNumber = (int) =>
{
	let num = parseInt(int);
	return isNaN(num) ? null : num;
};
siben.getParam = (key) =>
{
	return (new URL(document.location)).searchParams.get(key) ?? null;
};
siben.formatDate = (str) =>
{
	return encodeURIComponent(str.substring(0,19)+str.substring(23,29));
};
siben.loadJS = (src = null, location = document.head, callback = () => {}) =>
{
	let script = document.createElement('script');
	script.onload = callback;
	script.src = src;
	location.appendChild(script);
};
siben.result = 10;
siben.getPage = (data) =>
{
	let feed = data.feed;
	if(feed.entry[0] !== undefined && feed !== undefined)
	{
		let index = feed.openSearch$startIndex.$t;
		let time = siben.formatDate(feed.entry[0].published.$t);
		let page = Math.ceil(index/siben.result)+1;
		if(blog.category)
			document.location.href = '/search/label/'+blog.category+'?updated-max='+time+'&page='+page;
		else if(blog.search)
			document.location.href = '/search?q='+blog.search+'&updated-max='+time+'&page='+page;
		else
			document.location.href = '/search?updated-max='+time+'&page='+page;
	}
};
siben.redirect = (page) =>
{
	let start = (page-1)*siben.result;
	if(blog.category){
      if(page <= 1 && siben.isNumber(page))
          document.location.href = '/search/label/'+blog.category;
      else
          siben.loadJS('/feeds/posts/summary?category='+blog.category+'&start-index='+start+'&max-results=1&alt=json-in-script&callback=siben.getPage');
	}else if(blog.search){
      if(page <= 1 && siben.isNumber(page))
          document.location.href = '/search?q='+blog.search;
      else
          siben.loadJS('/feeds/posts/summary?q='+blog.search+'&start-index='+start+'&max-results=1&alt=json-in-script&callback=siben.getPage');
	}else{
      if(page <= 1 && siben.isNumber(page))
          document.location.href = '/';
      else
          siben.loadJS('/feeds/posts/summary?start-index='+start+'&max-results=1&alt=json-in-script&callback=siben.getPage');
	}
};
siben.getPagination = (data) =>
{
	const html = document.getElementById('pagination');
	let current = siben.isNumber(siben.getParam('page')) ?? 1;
	let limit = 2;
	let total = Math.ceil(data.feed.openSearch$totalResults.$t/siben.result);
	if(current <= 0 || current > total)
		return false;
	let start = current - limit < 1 ? 1 : current - limit;
	let end = current + limit > total ? total : current + limit;
	if(current > 1)
		html.innerHTML += '<a class="page" href="javascript:siben.redirect(' + (current-1) + ')">‹</a>';
	for(start; start<=end; start++)
		if(current === start)
			html.innerHTML += '<a class="page current" href="javascript:void(0)">' + start + '</a>';
		else
    		html.innerHTML += '<a class="page" href="javascript:siben.redirect(' + start + ')">' + start + '</a>';
	if(current < total)
		html.innerHTML += '<a class="page" href="javascript:siben.redirect(' + (current+1) + ')">›</a>';
};
