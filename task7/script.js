(function () {
    const BATCH_SIZE = 10;
    const SCROLL_THRESHOLD = 200;
    const DEBOUNCE_DELAY = 300;
    const SHORT_QUERY_DELAY = 2000;
    const SHORT_QUERY_LENGTH = 5;
    const API_URL = 'https://jsonplaceholder.typicode.com/posts';

    const model = {
        posts: [],
        searchQuery: '',
        isLoading: false,
        allLoaded: false,
        currentPage: 0
    };

    function getVisiblePosts() {
        const query = model.searchQuery.toLowerCase().trim();
        if (query === '') return model.posts;
        return model.posts.filter(function (post) {
            return post.title.toLowerCase().includes(query);
        });
    }

    async function fetchNextBatch() {
        const nextPage = model.currentPage + 1;
        const url = API_URL + '?_page=' + nextPage + '&_limit=' + BATCH_SIZE;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Сервер вернул статус ' + response.status);
        }

        const data = await response.json();
        return { data: data, page: nextPage };
    }

    const view = (function () {
        const listEl = document.getElementById('postList');
        const loaderEl = document.getElementById('loader');
        const errorEl = document.getElementById('errorMessage');
        const endEl = document.getElementById('endMessage');
        const emptyEl = document.getElementById('emptyMessage');

        function createCard(post) {
            const card = document.createElement('article');
            card.className = 'post-card';

            const user = document.createElement('span');
            user.className = 'post-user';
            user.textContent = 'Автор #' + post.userId;

            const title = document.createElement('h2');
            title.className = 'post-title';
            title.textContent = post.title;

            const text = document.createElement('p');
            text.className = 'post-body';
            text.textContent = post.body;

            card.appendChild(user);
            card.appendChild(title);
            card.appendChild(text);
            return card;
        }

        function renderPosts(posts) {
            listEl.innerHTML = '';
            posts.forEach(function (post) {
                listEl.appendChild(createCard(post));
            });
        }

        function setVisibility(el, on) {
            if (on) {
                el.classList.add('visible');
            } else {
                el.classList.remove('visible');
            }
        }

        return {
            renderPosts: renderPosts,
            showLoader: function () { setVisibility(loaderEl, true); },
            hideLoader: function () { setVisibility(loaderEl, false); },
            showError: function () { setVisibility(errorEl, true); },
            hideError: function () { setVisibility(errorEl, false); },
            showEnd: function () { setVisibility(endEl, true); },
            showEmpty: function (on) { setVisibility(emptyEl, on); }
        };
    })();

    let debounceTimer = null;
    const searchInput = document.getElementById('searchInput');
    const retryBtn = document.getElementById('retryBtn');

    function needMore() {
        if (model.isLoading || model.allLoaded) return false;
        const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
        return remaining <= SCROLL_THRESHOLD;
    }

    function refreshList() {
        const visible = getVisiblePosts();
        view.renderPosts(visible);
        view.showEmpty(visible.length === 0 && model.posts.length > 0);
    }

    async function loadMore() {
        if (model.isLoading || model.allLoaded) return;

        model.isLoading = true;
        view.hideError();
        view.showLoader();

        try {
            const result = await fetchNextBatch();

            if (result.data.length === 0) {
                model.allLoaded = true;
                view.showEnd();
            } else {
                result.data.forEach(function (post) {
                    model.posts.push(post);
                });
                model.currentPage = result.page;
                refreshList();
            }
        } catch (error) {
            view.showError();
        } finally {
            model.isLoading = false;
            view.hideLoader();
        }

        setTimeout(function () {
            if (needMore()) {
                loadMore();
            }
        }, 100);
    }

    function getDebounceDelay() {
        if (searchInput.value.length <= SHORT_QUERY_LENGTH) {
            return SHORT_QUERY_DELAY;
        }
        return DEBOUNCE_DELAY;
    }

    function handleScroll() {
        if (needMore()) {
            loadMore();
        }
    }

    function handleSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            model.searchQuery = searchInput.value;
            refreshList();
        }, getDebounceDelay());
    }

    window.addEventListener('scroll', handleScroll);
    searchInput.addEventListener('input', handleSearch);
    retryBtn.addEventListener('click', function () {
        view.hideError();
        loadMore();
    });

    loadMore();
})();
