(function () {
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var heading = document.getElementById("search-heading");

    if (!input || !results || !heading || !window.MOVIE_SEARCH_DATA) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
            "<span class=\"poster-play\">▶</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function render(query) {
        var q = query.toLowerCase();
        if (!q) {
            return;
        }

        input.value = query;
        var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            return text.indexOf(q) !== -1;
        }).slice(0, 120);

        heading.innerHTML = "<div><h2>搜索结果</h2><p>关键词：" + escapeHtml(query) + "</p></div>";
        results.innerHTML = matched.length ? matched.map(card).join("") : "<div class=\"empty-state\"><h2>未找到相关影片</h2><p>可以尝试更换片名、地区、年份或题材关键词。</p></div>";
    }

    render(keyword);
})();
