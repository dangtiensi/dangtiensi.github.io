const siben = new Object();
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
siben.maxResult = 10;
siben.getPage = (data) =>
{
	let feed = data.feed;
	if(feed.entry[0] !== undefined && feed !== undefined)
	{
		let index = feed.openSearch$startIndex.$t;
		let time = siben.formatDate(feed.entry[0].published.$t);
		let page = Math.ceil(index/siben.maxResult)+1;
		document.location.href = siben.domain()+'/search?updated-max='+time+'&max-results='+siben.maxResult+'&page='+page;
	}
};
siben.redirect = (page) =>
{
	if(page <= 1 && siben.isNumber(page))
		document.location.href = siben.domain();
	else
		siben.loadJS(siben.domain()+'/feeds/posts/summary?start-index='+(page-1)*siben.maxResult+'&max-results=1&alt=json-in-script&callback=siben.getPage');
};
siben.getPagination = (data) =>
{
	const html = document.getElementById('pagination');
	let current = siben.isNumber(siben.getParam('page')) ?? 1;
	let limit = 4;
	let total = Math.ceil(data.feed.openSearch$totalResults.$t/siben.maxResult);
	if(current <= 0 || current > total)
		return false;
	let start = current - limit < 1 ? 1 : current - limit;
	let end = current + limit > total ? total : current + limit;
	for(start; start<=end; start++)
    	html.innerHTML += '<a class="page'+ (current === start ? ' current' : '') + '" href="javascript:siben.redirect(' + start + ')">' + start + '</a>';
};
