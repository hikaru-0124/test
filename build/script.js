document.addEventListener('DOMContentLoaded', function() {

    // --- スムーズスクロール & アクティブなナビゲーションリンク ---
    const navLinks = document.querySelectorAll('header nav a:not(.dropdown-content a)'); // ドロップダウン内は除外
    const sections = document.querySelectorAll('main section, section.hero'); // ヒーローセクションも対象に

    function smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = document.querySelector('header').offsetHeight || 70;
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
            }
            // モバイルメニューの場合、クリック後に閉じる処理などをここに追加可能
        });
    });

    // スクロール時のアクティブリンクハイライト
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const headerHeight = document.querySelector('header').offsetHeight || 70;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50; // 50pxのマージン
            if (pageYOffset >= sectionTop) {
                currentSectionId = '#' + section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href') === currentSectionId) {
                link.parentElement.classList.add('active');
            }
        });
        // ドロップダウンの親もアクティブにする
        const activeDropdownLink = document.querySelector('.dropdown-content a[href="' + currentSectionId + '"]');
        if (activeDropdownLink) {
            activeDropdownLink.closest('.dropdown').classList.add('active');
        } else {
            // もしドロップダウンの親がアクティブで、中のリンクがアクティブでないなら親のアクティブも解除
            document.querySelectorAll('.dropdown.active').forEach(dd => {
                if (!dd.querySelector('.dropdown-content a.active')) { // .active classをaタグにもつける場合
                     // または、中のリンクが現在のセクションIDと一致しない場合
                    let found = false;
                    dd.querySelectorAll('.dropdown-content a').forEach(subLink => {
                        if (subLink.getAttribute('href') === currentSectionId) found = true;
                    });
                    if(!found) dd.classList.remove('active');
                }
            });
        }
    });


    // --- ニュース機能 ---
    const newsListEl = document.getElementById('news-list');
    const loadNewsButton = document.getElementById('load-news-button');

    // ダミーニュースデータ (HTMLに静的にあるので、ここでは追加分のみ)
    const additionalNews = [
        { date: '2024.06.25', category: {name: 'メディア', class: 'media'}, title: 'テレビ朝日「ミュージックステーション」出演決定！', link: 'news_detail_5.html' },
        { date: '2024.06.10', category: {name: 'FC', class: 'fc'}, title: 'ファンクラブイベント「Starlight Party Vol.2」詳細発表', link: 'news_detail_6.html' },
        { date: '2024.05.30', category: {name: 'その他', class: 'other'}, title: '雑誌「Idol Weekly」表紙＆巻頭特集掲載！', link: 'news_detail_7.html' }
    ];

    let newsCurrentlyDisplayed = document.querySelectorAll('#news-list li').length; // 初期表示数
    const newsIncrement = 3; // 一度に読み込む数

    function displayAdditionalNews() {
        const newsToLoad = additionalNews.slice(0, newsIncrement); // 常に配列の先頭から取得
        if (newsToLoad.length === 0 && loadNewsButton) {
            loadNewsButton.textContent = "これ以上ニュースはありません";
            loadNewsButton.disabled = true;
            return;
        }

        const fragment = document.createDocumentFragment();
        newsToLoad.forEach(newsItem => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="news-date">${newsItem.date}</span>
                <span class="news-category ${newsItem.category.class}">${newsItem.category.name}</span>
                <a href="${newsItem.link}">${newsItem.title}</a>
            `;
            fragment.appendChild(listItem);
            additionalNews.shift(); // 表示したものを配列から削除
        });
        if(newsListEl) newsListEl.appendChild(fragment);
        newsCurrentlyDisplayed += newsToLoad.length;

        if (additionalNews.length === 0 && loadNewsButton) {
            loadNewsButton.textContent = "これ以上ニュースはありません";
            loadNewsButton.disabled = true;
        }
    }

    if (loadNewsButton && newsListEl) {
        if (additionalNews.length > 0) {
            loadNewsButton.style.display = 'inline-block'; // 最初は表示
            loadNewsButton.addEventListener('click', displayAdditionalNews);
        } else {
            loadNewsButton.style.display = 'none'; // 追加ニュースがなければ非表示
        }
    }


    // --- ヒーローセクションのアニメーション ---
    const heroTitle = document.querySelector('.hero h2#hero-title');
    const heroSubtitle = document.querySelector('.hero .subtitle');
    const heroButtons = document.querySelectorAll('.hero .cta-buttons .btn');

    function fadeInElement(element, delay = 0) {
        if (element) {
            element.style.opacity = 0;
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
                element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }, delay);
        }
    }
    fadeInElement(heroTitle, 100);
    fadeInElement(heroSubtitle, 300);
    heroButtons.forEach((btn, index) => {
        fadeInElement(btn, 500 + index * 100);
    });


    // --- ギャラリー Lightbox機能 (簡易版) ---
    const galleryItems = document.querySelectorAll('.gallery-item a');
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    document.body.appendChild(lightbox); // bodyの最後に追加

    galleryItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            lightbox.classList.add('active');
            const imgSrc = item.getAttribute('href');
            const imgTitle = item.getAttribute('data-title') || '';

            lightbox.innerHTML = `
                <span class="lightbox-close">×</span>
                <img src="${imgSrc}" alt="${imgTitle}">
                <div id="lightbox-caption">${imgTitle}</div>
            `;

            const closeButton = lightbox.querySelector('.lightbox-close');
            closeButton.addEventListener('click', () => {
                lightbox.classList.remove('active');
                lightbox.innerHTML = ''; // 中身をクリア
            });
        });
    });

    // Lightboxの外側クリックで閉じる
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) { // 画像やキャプション以外をクリックした場合
            lightbox.classList.remove('active');
            lightbox.innerHTML = '';
        }
    });


    // --- ドロップダウンメニューのキーボード操作サポート (オプショナル) ---
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const dropbtn = dropdown.querySelector('.dropbtn');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        const dropdownLinks = dropdownContent.querySelectorAll('a');

        dropbtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isExpanded = dropdownContent.style.display === 'block';
                dropdownContent.style.display = isExpanded ? 'none' : 'block';
                dropbtn.setAttribute('aria-expanded', !isExpanded);
            }
        });

        // 必要に応じて、Tabキーや矢印キーでの操作も追加できます
    });

    console.log("Starlight Symphonyの拡張ウェブサイトへようこそ！");
});