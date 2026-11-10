(function () {
    const BATCH_SIZE = 10;
    const SCROLL_THRESHOLD = 200;
    const DEBOUNCE_DELAY = 300;
    const API_URL = 'https://jsonplaceholder.typicode.com/posts';

    const model = {
        posts: [],
        searchQuery: '',
        isLoading: false,
        allLoaded: false
    };

    function getVisiblePosts() {
        const query = model.searchQuery.toLowerCase();
        if (query === '') return model.posts;
        return model.posts.filter(function (post) {
            return post.title.toLowerCase().includes(query);
        });
    }

    async function fetchNextBatch() {
        const url = API_URL + '?_start=' + model.posts.length + '&_limit=' + BATCH_SIZE;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Сервер вернул статус ' + response.status);
        }
        return response.json();
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
            el.classList.toggle('visible', on);
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

        let loadedOk = false;
        try {
            const batch = await fetchNextBatch();
            if (batch.length === 0) {
                model.allLoaded = true;
                view.showEnd();
            } else {
                batch.forEach(function (post) {
                    model.posts.push(post);
                });
                refreshList();
                loadedOk = true;
            }
        } catch (error) {
            view.showError();
        } finally {
            model.isLoading = false;
            view.hideLoader();
        }

        if (loadedOk && needMore()) {
            loadMore();
        }
    }

    function handleScroll() {
        if (needMore()) {
            loadMore();
        }
    }

    function handleSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            model.searchQuery = searchInput.value.trim();
            refreshList();
        }, DEBOUNCE_DELAY);
    }

    window.addEventListener('scroll', handleScroll);
    searchInput.addEventListener('input', handleSearch);
    retryBtn.addEventListener('click', loadMore);

    loadMore();
})();

