// 初始化变量
let checkInCount = parseInt(localStorage.getItem('checkInCount')) || 0;
let isMusicPlaying = false;
let musicFiles = [];
let currentMusic = null;

// NFC功能支持检测
let isNFCSupported = 'NDEFReader' in window;

// 加载Web NFC Polyfill
if (!isNFCSupported) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/web-nfc-polyfill@latest/dist/web-nfc-polyfill.min.js';
    script.onload = () => {
        isNFCSupported = true;
        initNFC();
    };
    document.head.appendChild(script);
} else {
    initNFC();
}

// 显示NFC不支持提示
function showNFCUnsupported() {
    showMessage(`
        <div class="nfc-error">
            <div class="nfc-icon">⚠️</div>
            <div class="nfc-text">
                <div class="nfc-title">NFC Not Supported</div>
                <div class="nfc-subtitle">Your device does not support NFC functionality</div>
            </div>
        </div>
    `);
}

// NFC初始化函数
function initNFC() {
    if (!isNFCSupported) return;

    let nfcReader;
    
    // 使用原生API或polyfill
    if ('NDEFReader' in window) {
        nfcReader = new NDEFReader();
    } else if (typeof NFC !== 'undefined') {
        nfcReader = new NFC();
    } else {
        showNFCUnsupported();
        return;
    }

    // 请求NFC权限
    if (typeof navigator.permissions !== 'undefined') {
        navigator.permissions.query({ name: 'nfc' }).then(permissionStatus => {
            if (permissionStatus.state === 'denied') {
                showMessage(`
                    <div class="nfc-error">
                        <div class="nfc-icon">⚠️</div>
                        <div class="nfc-text">
                            <div class="nfc-title">NFC Permission Denied</div>
                            <div class="nfc-subtitle">Please enable NFC permissions in your browser settings</div>
                        </div>
                    </div>
                `);
                return;
            }
        });
    }
    
    // 设置扫描超时
    let nfcTimeout;
    
    // NFC扫描成功处理
    nfcReader.onreading = event => {
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
            if (record.recordType === "text") {
                const text = decoder.decode(record.data);
                handleNFCTag(text);
            }
        }
    };

    // NFC扫描错误处理
    nfcReader.onreadingerror = error => {
        console.error('NFC read error:', error);
    };

    // 开始NFC扫描
    nfcReader.scan().then(() => {
        console.log('NFC scan started');
        
        // 设置10秒超时
        nfcTimeout = setTimeout(() => {
            showMessage(`
                <div class="nfc-error">
                    <div class="nfc-icon">⏳</div>
                    <div class="nfc-text">
                        <div class="nfc-title">NFC Scan Timeout</div>
                        <div class="nfc-subtitle">Please try scanning again</div>
                    </div>
                </div>
            `);
        }, 10000);
    }).catch(error => {
        console.error('Unable to start NFC scan:', error);
        showMessage(`
            <div class="nfc-error">
                <div class="nfc-icon">⚠️</div>
                <div class="nfc-text">
                    <div class="nfc-title">NFC Scan Failed</div>
                    <div class="nfc-subtitle">${error.message}</div>
                </div>
            </div>
        `);
    });
}

// 预加载动画元素
const nfcPopup = document.createElement('div');
nfcPopup.className = 'nfc-animation';
nfcPopup.innerHTML = `
    <div class="nfc-icon">📱</div>
    <div class="nfc-text">
        <div class="nfc-title">NFC Sign in successfully！</div>
        <div class="nfc-subtitle">🙏 May God bless your day ✨</div>
    </div>
`;
document.body.appendChild(nfcPopup);
nfcPopup.style.display = 'none';

// NFC标签处理
function handleNFCTag(tagData) {
    // 清除超时计时器
    if (nfcTimeout) {
        clearTimeout(nfcTimeout);
    }
    
    // 验证标签格式
    if (!tagData || typeof tagData !== 'string') {
        showMessage(`
            <div class="nfc-error">
                <div class="nfc-icon">⚠️</div>
                <div class="nfc-text">
                    <div class="nfc-title">Invalid NFC Tag</div>
                    <div class="nfc-subtitle">Please use a valid check-in tag</div>
                </div>
            </div>
        `);
        return;
    }

    // 检查是否是签到标签
    if (tagData === 'checkin') {
        // 立即显示预加载的动画
        nfcPopup.style.display = 'flex';
        
        // 异步执行签到逻辑
        setTimeout(() => {
            checkIn();
            
            // 1秒后显示成功信息
            setTimeout(() => {
                nfcPopup.style.display = 'none';
                showMessage(`
                    <div class="checkin-success">
                        <div class="checkin-icon">✓</div>
                        <div class="checkin-text">
                            <div class="checkin-title">NFC successful！</div>
                            <div class="nfc-subtitle">May God bless your day!</div>
                        </div>
                    </div>
                `);
            }, 1000);
        }, 0);
    }
}

// 获取音乐文件列表
function getMusicFiles() {
    return [
        'music/1.MP3',
        'music/2.MP3',
        'music/3.MP3',
        'music/4.MP3',
        'music/5.MP3',
        'music/6.MP3',
        'music/7.MP3',
        'music/8.MP3',
        'music/9.MP3',
        'music/10.MP3'
    ];
}

// 播放随机音乐
function playRandomMusic() {
    if (currentMusic) {
        currentMusic.pause();
    }
    
    const files = getMusicFiles();
    const randomFile = files[Math.floor(Math.random() * files.length)];
    currentMusic = new Audio(randomFile);
    currentMusic.volume = volumeSlider.value;
    currentMusic.play();
    isMusicPlaying = true;
    document.querySelector('.play-pause').textContent = 'Pause';
}

const volumeSlider = document.querySelector('.volume-slider');
// 背景图片轮播
let currentBgIndex = 0;
const bgImages = [
    './images/bg1.jpg',
    './images/bg2.jpg', 
    './images/bg3.jpg',
    './images/bg4.jpg',
    './images/bg5.jpg'
];

function changeBackground() {
    // 创建新的图片元素
    const newBg = new Image();
    const randomIndex = Math.floor(Math.random() * bgImages.length);
    newBg.src = bgImages[randomIndex];
    
    // 图片加载完成后执行切换
    newBg.onload = () => {
        // 添加淡入效果
        document.body.style.opacity = '0';
        
        // 设置新背景
        setTimeout(() => {
            document.body.style.backgroundImage = `url(${newBg.src})`;
            document.body.style.opacity = '1';
        }, 300);
    };
    
    // 添加平滑过渡效果
    document.body.style.transition = 'opacity 0.5s ease-in-out, background-image 0.5s ease-in-out';
}

// 初始化背景
const initialBgIndex = Math.floor(Math.random() * bgImages.length);
document.body.style.backgroundImage = `url(${bgImages[initialBgIndex]})`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundPosition = 'center';
document.body.style.backgroundRepeat = 'no-repeat';
document.body.style.backgroundColor = 'transparent';

// 每5秒切换一次背景
setInterval(changeBackground, 10000);

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 初始化音乐播放器状态
    const musicPlayer = document.querySelector('.music-player');
    const crossContainer = document.querySelector('.cross-container');
    
    // 添加十字架点击事件
    crossContainer.addEventListener('click', () => {
        musicPlayer.classList.toggle('collapsed');
        
        // 如果展开且音乐未播放，自动播放音乐
        if (!musicPlayer.classList.contains('collapsed') && !isMusicPlaying) {
            toggleMusic();
        }
    });

    // Initialize check-in count display
    const checkInContainer = document.getElementById('checkInCount');
    if (checkInContainer) {
        checkInContainer.innerHTML = `
            <div class="checkin-count">
                <div class="checkin-number">${checkInCount}</div>
                <div class="checkin-label">days of faithfulness</div>
                <div class="checkin-blessing">God bless your journey!</div>
            </div>
        `;
    }
    
    // 确保DOM完全加载后再获取每日经文
    setTimeout(() => {
        fetchDailyVerse();
    }, 100);
});

// 获取今天的日期字符串
function getTodayDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// 获取每日经文
async function fetchDailyVerse() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/gggccclll/Faithopia/main/wenan/wenan.txt');
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.statusText}`);
        }
        const text = await response.text();
        
        // 按换行符分割经文
        const verses = text.split('\n');
        
        // 随机选取一条经文
        const index = Math.floor(Math.random() * verses.length);
        const verse = verses[index].trim();
        
        // 显示经文
        const verseContainer = document.getElementById('dailyVerse');
        if (verseContainer) {
            verseContainer.innerHTML = `
                <div class="verse-text">${verse}</div>
            `;
        }
    } catch (error) {
        console.error('Error fetching daily verse:', error);
        
        // 备用英文圣经
        const backupVerses = [
            "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. - John 3:16",
            "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight. - Proverbs 3:5-6",
            "I can do all this through him who gives me strength. - Philippians 4:13",
            "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go. - Joshua 1:9",
            "But seek first his kingdom and his righteousness, and all these things will be given to you as well. - Matthew 6:33",
            "The LORD is my shepherd, I lack nothing. - Psalm 23:1",
            "And we know that in all things God works for the good of those who love him, who have been called according to his purpose. - Romans 8:28",
            "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. - Philippians 4:6",
            "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future. - Jeremiah 29:11",
            "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law. - Galatians 5:22-23"
        ];
        
        // 随机选择一条备用经文
        const index = Math.floor(Math.random() * backupVerses.length);
        const verse = backupVerses[index];
        
        // 显示备用经文
        const verseContainer = document.getElementById('dailyVerse');
        if (verseContainer) {
            verseContainer.innerHTML = `
                <div class="verse-text">${verse}</div>
            `;
        }
    }
}

// 签到功能
function checkIn() {
    const lastCheckInDate = localStorage.getItem('lastCheckInDate');
    const today = getTodayDateString();
    
    // Initialize checkInCount if not exists
    if (!localStorage.getItem('checkInCount')) {
        localStorage.setItem('checkInCount', '0');
    }
    
    // Get current count
    checkInCount = parseInt(localStorage.getItem('checkInCount'));
    
    // Check if already checked in today
    if (lastCheckInDate === today) {
        showMessage(`
            <div class="checkin-success">
                <div class="checkin-icon">✓</div>
                <div class="checkin-text">
                    <div class="checkin-title">You have already checked in today</div>
                    <div class="checkin-subtitle">Please keep up the good work!</div>
                </div>
            </div>
        `);
        return;
    }

    // Update check-in count
    if (lastCheckInDate !== today) {
        checkInCount++;
    }
    localStorage.setItem('checkInCount', checkInCount);
    localStorage.setItem('lastCheckInDate', today);
    
    // Update display
    const checkInContainer = document.getElementById('checkInCount');
    if (checkInContainer) {
        checkInContainer.innerHTML = `
            <div class="checkin-count">
                <div class="checkin-number">${checkInCount}</div>
                <div class="checkin-label">days of faithfulness</div>
                <div class="checkin-blessing">God bless your journey!</div>
            </div>
        `;
        
        // Show success message
        showMessage(`
            <div class="checkin-success">
                <div class="checkin-icon">✓</div>
                <div class="checkin-text">
                    <div class="checkin-title">Check-in Successful!</div>
                    <div class="checkin-subtitle">May God bless your day!</div>
                </div>
            </div>
        `);
    } else {
        console.error('Cannot find #checkInCount element');
    }
    
    // Play music if not playing
    if (!isMusicPlaying) {
        toggleMusic();
    }
}

// 显示消息弹窗
function showMessage(message) {
    const messageBox = document.getElementById('message');
    const messageContent = messageBox.querySelector('.message-content');
    messageContent.innerHTML = message + `
        <button id="closeMessageButton" class="close-button" onclick="closeMessage()">Close</button>
    `;
    messageBox.style.display = 'flex';
}

// 关闭消息弹窗
function closeMessage() {
    document.getElementById('message').style.display = 'none';
}

// 音乐控制
function toggleMusic() {
    const playPauseButton = document.querySelector('.play-pause');
    const resumeButton = document.querySelector('.resume-music');
    
    if (isMusicPlaying) {
        if (currentMusic) {
            currentMusic.pause();
        }
        playPauseButton.textContent = 'Play';
        resumeButton.style.display = 'none';
    } else {
        if (!currentMusic) {
            playRandomMusic();
        } else {
            currentMusic.play();
        }
        playPauseButton.textContent = 'Pause';
        resumeButton.style.display = 'block';
    }
    isMusicPlaying = !isMusicPlaying;
}

// 恢复音乐播放
function resumeMusic() {
    if (currentMusic) {
        currentMusic.currentTime = 0;
        currentMusic.play();
        isMusicPlaying = true;
        document.querySelector('.play-pause').textContent = 'Pause';
    }
}

// 显示重置确认弹窗
function showResetConfirmation() {
    document.getElementById('resetConfirmation').style.display = 'flex';
}

// 关闭重置确认弹窗
function closeResetConfirmation() {
    document.getElementById('resetConfirmation').style.display = 'none';
}

// 重置所有数据
function resetAll() {
    // Reset check-in count and last check-in date
    checkInCount = 0;
    localStorage.setItem('checkInCount', checkInCount);
    localStorage.removeItem('lastCheckInDate');
    document.getElementById('checkInCount').innerHTML = `
        <div class="checkin-count">
            <div class="checkin-number">${checkInCount}</div>
            <div class="checkin-label">days of faithfulness</div>
            <div class="checkin-blessing">God bless your journey!</div>
        </div>
    `;
    
    // Reset music state
    if (currentMusic) {
        currentMusic.pause();
    }
    isMusicPlaying = false;
    document.querySelector('.play-pause').textContent = 'Play';
    currentMusic = null;
    
    // Close confirmation popup
    closeResetConfirmation();
    
    // Show reset success message
    showMessage('All data has been successfully reset!');
}
