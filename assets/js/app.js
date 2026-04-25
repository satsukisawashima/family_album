const STORAGE_KEY = 'puppyAlbumPosts';
const MAX_IMAGES = 5;
const photoInput = document.getElementById('photoInput');
const captionInput = document.getElementById('captionInput');
const preview = document.getElementById('preview');
const previewGrid = document.getElementById('previewGrid');
const previewCaption = document.getElementById('previewCaption');
const previewMood = document.getElementById('previewMood');
const previewStory = document.getElementById('previewStory');
const postList = document.getElementById('postList');
const postForm = document.getElementById('postForm');

const moodCategories = {
  happy: 'うれしいな',
  playful: 'わくわくしているよ',
  tired: 'きもちよくねむい',
  curious: 'どきどきしてる',
  loving: 'だいすきだよ'
};

const storyTemplates = {
  happy: [
    '今日はいっぱい走って気持ちがよかったよ！',
    'おひさまの中でうれしくてにこにこしてたよ。',
    'おやつももらえて、しあわせいっぱいだったよ。'
  ],
  playful: [
    'あっちもこっちも探索して、わくわくが止まらないよ！',
    '新しいにおいがたくさんして、とってもたのしかった！',
    'おさんぽって、やっぱり最高だよね！'
  ],
  tired: [
    'ちょっとねむくなってきたけど、みんながいるから安心だよ。',
    'たくさん遊んで、もうすこしゆっくりしたいな。',
    'あったかいところでのんびりしているのが好きだよ。'
  ],
  curious: [
    'ここはどこかな？でもなんだかワクワクする！',
    'あたらしいものがいっぱいで、いろいろ見てみたいな。',
    'この場所、においが不思議でたのしいよ。'
  ],
  loving: [
    'ママがそばにいてくれて、とっても安心するよ。',
    'パパがなでてくれると、もっともっとだいすきになるよ。',
    'いっしょにいる時間がいちばんしあわせだよ。'
  ]
};

function normalizeText(text) {
  return (text || '').trim().toLowerCase();
}

function getMoodCategory(caption, fileNames = []) {
  const text = normalizeText(caption);
  if (text.match(/さんぽ|散歩|公園|おさんぽ|走る|ラン/)) {
    return 'playful';
  }
  if (text.match(/ねむ|おやすみ|すやすや|眠い|お昼寝/)) {
    return 'tired';
  }
  if (text.match(/たべ|ごはん|おやつ|おいしい|ディナー|ランチ|食べ/)) {
    return 'happy';
  }
  if (text.match(/ママ|パパ|なで|だいすき|いっしょ|愛して/)) {
    return 'loving';
  }
  if (text.match(/どこ|わくわく|不思議|はじめて|初めて|きょろきょろ/)) {
    return 'curious';
  }

  const fileHint = fileNames.join(' ').toLowerCase();
  if (fileHint.match(/park|walk|outdoor|play|dog|散歩|公園/)) {
    return 'playful';
  }
  if (fileHint.match(/sleep|nap|bed|ねむ|おやすみ/)) {
    return 'tired';
  }

  const categories = Object.keys(moodCategories);
  return categories[Math.floor(Math.random() * categories.length)];
}

function getMood(category) {
  return moodCategories[category] || moodCategories.happy;
}

function getRandomStory(category) {
  const list = storyTemplates[category] || storyTemplates.happy;
  return list[Math.floor(Math.random() * list.length)];
}

function generateStory(caption, category) {
  const baseStory = getRandomStory(category);
  if (caption) {
    return `${caption}  ${baseStory}`;
  }
  return baseStory;
}

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('投稿の読み込みに失敗しました', error);
    return [];
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readFilesAsDataURL(files) {
  return Promise.all(Array.from(files).map((file) => readFileAsDataURL(file)));
}

function updatePreview() {
  const files = Array.from(photoInput.files || []);
  const caption = captionInput.value.trim();
  if (files.length === 0) {
    hidePreview();
    return;
  }

  if (files.length > MAX_IMAGES) {
    alert(`最大${MAX_IMAGES}枚まで投稿できます。`);
    photoInput.value = '';
    hidePreview();
    return;
  }

  readFilesAsDataURL(files).then((images) => {
    previewGrid.innerHTML = images
      .map((image) => `<div class="photo-card"><img src="${image}" alt="投稿プレビュー" /></div>`)
      .join('');

    const category = getMoodCategory(caption, files.map((file) => file.name));
    previewMood.textContent = `犬の気持ち：${getMood(category)}`;
    previewStory.textContent = generateStory(caption, category);
    previewCaption.textContent = caption ? `あなたのコメント: ${caption}` : 'コメントなしでも犬の気持ちが自動生成されます。';
    preview.classList.remove('hidden');
  }).catch((error) => {
    console.error('プレビュー画像の読み込みに失敗しました', error);
    hidePreview();
  });
}

function hidePreview() {
  preview.classList.add('hidden');
  previewGrid.innerHTML = '';
  previewCaption.textContent = '';
  previewMood.textContent = '';
  previewStory.textContent = '';
}

function renderPosts() {
  const posts = loadPosts();
  postList.innerHTML = '';

  if (posts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-posts';
    empty.textContent = 'まだ投稿がありません。まずは写真を選んで投稿してみましょう。';
    postList.appendChild(empty);
    return;
  }

  posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach((post) => {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.dataset.id = post.id;
    article.innerHTML = `
      <div class="photo-grid">
        ${post.images.map((src) => `<div class="photo-card"><img src="${src}" alt="投稿された犬の写真" /></div>`).join('')}
      </div>
      <div class="post-body">
        <header>
          <div class="post-meta">
            <span>${formatDate(post.createdAt)}</span>
            <span class="tag">${post.mood}</span>
          </div>
        </header>
        ${post.caption ? `<p class="post-user-comment"><strong>メモ：</strong>${escapeHtml(post.caption)}</p>` : ''}
        <p class="post-story">${escapeHtml(post.story)}</p>
      </div>
    `;
    postList.appendChild(article);
  });
}

photoInput.addEventListener('change', updatePreview);
captionInput.addEventListener('input', () => {
  if (!preview.classList.contains('hidden')) {
    updatePreview();
  }
});

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const files = Array.from(photoInput.files || []);
  const caption = captionInput.value.trim();

  if (files.length === 0) {
    alert('写真を選択してください。');
    return;
  }

  if (files.length > MAX_IMAGES) {
    alert(`最大${MAX_IMAGES}枚まで投稿できます。`);
    return;
  }

  try {
    const images = await readFilesAsDataURL(files);
    const category = getMoodCategory(caption, files.map((file) => file.name));
    const mood = getMood(category);
    const story = generateStory(caption, category);
    const posts = loadPosts();
    posts.push({
      id: Date.now(),
      images,
      caption,
      mood,
      story,
      createdAt: new Date().toISOString()
    });
    savePosts(posts);
    postForm.reset();
    hidePreview();
    renderPosts();
  } catch (error) {
    console.error('投稿の保存に失敗しました', error);
    alert('投稿に失敗しました。もう一度お試しください。');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  renderPosts();
});
