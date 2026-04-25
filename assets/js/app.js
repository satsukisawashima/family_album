const STORAGE_KEY = 'familyAlbumPosts';
const photoInput = document.getElementById('photoInput');
const captionInput = document.getElementById('captionInput');
const preview = document.getElementById('preview');
const previewImage = document.getElementById('previewImage');
const previewCaption = document.getElementById('previewCaption');
const previewMood = document.getElementById('previewMood');
const postList = document.getElementById('postList');
const postForm = document.getElementById('postForm');

const moods = [
  'うれしいな',
  'わくわくしているよ',
  'おなかいっぱい',
  'のんびりしたいな',
  'おさんぽしたい',
  'もっと遊びたい',
  'ひなたぼっこ中',
  'きもちよくねむい',
  'だいすきだよ'
];

function getMood(caption) {
  const text = caption.trim().toLowerCase();
  if (text.includes('うれ') || text.includes('たの') || text.includes('にこ')) {
    return 'うれしいな';
  }
  if (text.includes('さんぽ') || text.includes('さんぽ')) {
    return 'おさんぽしたい';
  }
  if (text.includes('ねむ') || text.includes('おやすみ')) {
    return 'きもちよくねむい';
  }
  if (text.includes('おい') || text.includes('たべ')) {
    return 'おなかいっぱい';
  }
  if (text.includes('こわ') || text.includes('いや')) {
    return 'ちょっとドキドキ';
  }
  return moods[Math.floor(Math.random() * moods.length)];
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

function renderPosts() {
  const posts = loadPosts();
  postList.innerHTML = '';

  if (posts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-posts';
    empty.textContent = 'まだ投稿がありません。写真を選んでコメントといっしょに投稿してください。';
    postList.appendChild(empty);
    return;
  }

  posts.slice().reverse().forEach((post) => {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.innerHTML = `
      <header>
        <div class="post-meta">
          <span>${formatDate(post.createdAt)}</span>
          <span>犬の気持ち：${post.mood}</span>
        </div>
      </header>
      <img src="${post.image}" alt="投稿された犬の写真" />
      <div class="post-body">
        <p class="post-caption">${escapeHtml(post.caption)}</p>
      </div>
    `;
    postList.appendChild(article);
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showPreview(imageSrc, caption, mood) {
  previewImage.src = imageSrc;
  previewCaption.textContent = caption || 'コメントがありません。';
  previewMood.textContent = `犬の気持ち：${mood}`;
  preview.classList.remove('hidden');
}

function hidePreview() {
  preview.classList.add('hidden');
  previewImage.src = '';
  previewCaption.textContent = '';
  previewMood.textContent = '';
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

photoInput.addEventListener('change', async () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) {
    hidePreview();
    return;
  }

  const caption = captionInput.value.trim();
  const mood = getMood(caption);
  try {
    const imageSrc = await readFileAsDataURL(file);
    showPreview(imageSrc, caption, mood);
  } catch (error) {
    console.error('画像の読み込みに失敗しました', error);
    hidePreview();
  }
});

captionInput.addEventListener('input', () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) {
    return;
  }

  const caption = captionInput.value.trim();
  const mood = getMood(caption);
  if (preview.classList.contains('hidden')) {
    return;
  }
  previewMood.textContent = `犬の気持ち：${mood}`;
  previewCaption.textContent = caption || 'コメントがありません。';
});

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = photoInput.files && photoInput.files[0];
  const caption = captionInput.value.trim();

  if (!file) {
    alert('写真を選択してください。');
    return;
  }

  try {
    const imageSrc = await readFileAsDataURL(file);
    const mood = getMood(caption);
    const posts = loadPosts();
    posts.push({
      id: Date.now(),
      image: imageSrc,
      caption,
      mood,
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
