document.addEventListener('DOMContentLoaded', function() {

    // --- ユーティリティ関数 ---
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // --- スムーズスクロール & アクティブなナビゲーションリンク ---
    const navLinks = document.querySelectorAll('header nav a:not(.dropdown-content a)');
    const sections = document.querySelectorAll('main section, section.hero');
    const headerEl = document.querySelector('header'); // ヘッダー要素を取得

    function smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = headerEl.offsetHeight || 70;
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
        });
    });

    function updateActiveLink() {
        let currentSectionId = '';
        const headerHeight = headerEl.offsetHeight || 70;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100; // 少し多めにオフセット
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
        const activeDropdownLink = document.querySelector('.dropdown-content a[href="' + currentSectionId + '"]');
        if (activeDropdownLink) {
            activeDropdownLink.closest('.dropdown').classList.add('active');
        } else {
            document.querySelectorAll('.dropdown.active').forEach(dd => {
                let found = false;
                dd.querySelectorAll('.dropdown-content a').forEach(subLink => {
                    if (subLink.getAttribute('href') === currentSectionId) found = true;
                });
                if(!found) dd.classList.remove('active');
            });
        }
    }
    window.addEventListener('scroll', debounce(updateActiveLink, 100));
    updateActiveLink(); // 初期表示時にも実行

    // --- ヘッダーのスクロール変化 ---
    function handleHeaderScroll() {
        if (window.scrollY > 50) { // 50pxスクロールしたら
            headerEl.classList.add('scrolled');
        } else {
            headerEl.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', debounce(handleHeaderScroll, 50));
    handleHeaderScroll(); // 初期表示時にも実行

    // --- スクロールに応じた要素のアニメーション (Intersection Observer) ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // 一度表示されたら監視を解除
            }
        });
    };

    const observerOptions = {
        root: null, // ビューポートをルートとする
        rootMargin: '0px',
        threshold: 0.1 // 10%要素が見えたら発火
    };

    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // アニメーションさせたい要素に .animate-on-scroll と、
    // CSS側で .fade-in, .slide-in-bottom などのクラスを用意しておく必要があります。
    // 例: HTML側で <section id="news" class="animate-on-scroll fade-in">

    // --- タイピングアニメーション ---
    const typingTargets = document.querySelectorAll('.typing-effect');
    typingTargets.forEach(target => {
        const text = target.getAttribute('data-text') || target.textContent;
        const speed = parseInt(target.getAttribute('data-speed'), 10) || 100; // 100ms
        target.textContent = ''; // 元のテキストをクリア
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                target.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                target.classList.add('typing-done'); // アニメーション完了のクラス
            }
        }
        // 遅延させて開始（ Intersection Observer と組み合わせるのも良い）
        setTimeout(typeWriter, 500 + (parseInt(target.getAttribute('data-delay'), 10) || 0));
    });


    // --- ニュース機能 (変更なし) ---
    const newsListEl = document.getElementById('news-list');
    const loadNewsButton = document.getElementById('load-news-button');
    const additionalNews = [
        { date: '2024.06.25', category: {name: 'メディア', class: 'media'}, title: 'テレビ朝日「ミュージックステーション」出演決定！', link: 'news_detail_5.html' },
        { date: '2024.06.10', category: {name: 'FC', class: 'fc'}, title: 'ファンクラブイベント「Starlight Party Vol.2」詳細発表', link: 'news_detail_6.html' },
        { date: '2024.05.30', category: {name: 'その他', class: 'other'}, title: '雑誌「Idol Weekly」表紙＆巻頭特集掲載！', link: 'news_detail_7.html' }
    ];
    let newsCurrentlyDisplayed = newsListEl ? newsListEl.querySelectorAll('li').length : 0;
    const newsIncrement = 3;

    function displayAdditionalNews() {
        const newsToLoad = additionalNews.slice(0, newsIncrement);
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
            additionalNews.shift();
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
            loadNewsButton.style.display = 'inline-block';
            loadNewsButton.addEventListener('click', displayAdditionalNews);
        } else {
            loadNewsButton.style.display = 'none';
        }
    }

    // --- ヒーローセクションのアニメーション (タイピングに置き換えまたは併用) ---
    // 既存のfadeInElementは、タイピングエフェクトと競合しないように調整するか、
    // Intersection Observerで管理される要素に含めることを検討します。
    // ここではタイピングエフェクトを優先し、既存のヒーローアニメーションはコメントアウトまたは削除。
    /*
    const heroTitle = document.querySelector('.hero h2#hero-title');
    const heroSubtitle = document.querySelector('.hero .subtitle');
    const heroButtons = document.querySelectorAll('.hero .cta-buttons .btn');
    function fadeInElement(element, delay = 0) { ... }
    fadeInElement(heroTitle, 100);
    fadeInElement(heroSubtitle, 300);
    heroButtons.forEach((btn, index) => { ... });
    */

    // --- ギャラリー Lightbox機能 (変更なし) ---
    const galleryItems = document.querySelectorAll('.gallery-item a');
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    document.body.appendChild(lightbox);

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
                lightbox.innerHTML = '';
            });
        });
    });
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            lightbox.innerHTML = '';
        }
    });

    // --- メンバーカードの3Dチルトエフェクト (Vanilla-Tilt.js を使う場合) ---
    // Vanilla-Tilt.js を別途読み込む必要があります。
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js"></script>
    if (typeof VanillaTilt !== 'undefined') {
        const tiltElements = document.querySelectorAll('.member-card, .disco-item img, .gallery-item'); // チルトさせたい要素
        VanillaTilt.init(tiltElements, {
            max: 10,             // 最大傾斜角度
            speed: 400,          // 速度
            glare: true,         // グレア効果
            "max-glare": 0.2,    // グレアの強さ
            perspective: 1000,   // パースペクティブ
            scale: 1.02          // 少し拡大
        });
    } else {
        console.warn("Vanilla-Tilt.js is not loaded. 3D tilt effect will not be applied.");
    }


    // --- マウス追従キラキラエフェクト (簡易版) ---
    const sparkleContainer = document.querySelector('.hero'); // キラキラを表示するコンテナ
    if (sparkleContainer) {
        sparkleContainer.style.position = 'relative'; // position: relative がないと正しく配置されない
        sparkleContainer.style.overflow = 'hidden';    // はみ出したキラキラを隠す

        sparkleContainer.addEventListener('mousemove', debounce(function(e) {
            const sparkle = document.createElement('span');
            sparkle.classList.add('sparkle-effect');
            // sparkleContainer の左上からの相対座標を計算
            const rect = sparkleContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';

            // ランダムなサイズと色（CSSで定義した方が柔軟）
            const size = Math.random() * 10 + 5; // 5px to 15px
            sparkle.style.width = size + 'px';
            sparkle.style.height = size + 'px';
            // 色のバリエーションはCSSで .sparkle-effect の :nth-child などで制御すると良い
            // 例: sparkle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 75%)`;

            sparkleContainer.appendChild(sparkle);

            setTimeout(() => {
                sparkle.remove();
            }, 1000); // 1秒後に消える
        }, 20)); // 20msごとにイベント発火（軽めに）
    }


    console.log("Starlight Symphonyの動くウェブサイトへようこそ！");
});