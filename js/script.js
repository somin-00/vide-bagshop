// Three.js 3D 가방 구현
let scene, camera, renderer, bag, controls;
let currentColor = '#8B4513';
let originalMaterials = new Map(); // 원본 재질 저장
let isLoading = false;

// 인기상품 데이터
const popularProducts = [
    { id: 1, name: '토트백', price: '₩159,000', emoji: '👜', description: '일상생활에 적합한 실용적인 토트백' },
    { id: 2, name: '크로스백', price: '₩89,000', emoji: '🎒', description: '가볍고 편리한 크로스백' },
    { id: 3, name: '숄더백', price: '₩199,000', emoji: '👜', description: '우아한 디자인의 숄더백' },
    { id: 4, name: '백팩', price: '₩129,000', emoji: '🎒', description: '학생과 직장인을 위한 백팩' },
    { id: 5, name: '클러치백', price: '₩79,000', emoji: '💼', description: '파티용 소형 클러치백' },
    { id: 6, name: '웨이스트백', price: '₩69,000', emoji: '👜', description: '트렌디한 웨이스트백' },
    { id: 7, name: '서류가방', price: '₩249,000', emoji: '💼', description: '비즈니스 서류가방' },
    { id: 8, name: '여행용가방', price: '₩189,000', emoji: '🧳', description: '대용량 여행용 가방' },
    { id: 9, name: '미니백', price: '₩59,000', emoji: '👜', description: '간소한 미니백' }
];

let currentIndex = 0;
let showingMore = false;

// Three.js 초기화
function initThreeJS() {
    console.log('Three.js 초기화 시작...');
    
    const container = document.getElementById('threejs-container');
    if (!container) {
        console.error('threejs-container를 찾을 수 없습니다.');
        return;
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    console.log('컨테이너 크기:', width, 'x', height);

    // 씬 생성
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 카메라 설정
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // 렌더러 설정
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 3D 가방 모델 로드
    loadBagModel();

    // OrbitControls 설정
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2;
    } else {
        console.error('OrbitControls를 찾을 수 없습니다.');
    }

    // 애니메이션 루프
    animate();

    // 윈도우 리사이즈 처리
    window.addEventListener('resize', onWindowResize);
    
    console.log('Three.js 초기화 완료');
}

// 3D 가방 모델 로드
function loadBagModel() {
    console.log('3D 모델 로드 시작...');
    
    // GLTFLoader가 있는지 확인
    if (typeof THREE.GLTFLoader === 'undefined') {
        console.error('GLTFLoader를 찾을 수 없습니다. 대체 모델을 생성합니다.');
        createFallbackModel();
        return;
    }
    
    if (isLoading) {
        console.log('이미 모델을 로드 중입니다.');
        return;
    }
    
    isLoading = true;
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        'assets/base.glb',
        function (gltf) {
            console.log('3D 모델 로드 성공:', gltf);
            bag = gltf.scene;
            
            // 모델 크기 조정 및 위치 설정
            bag.scale.set(1.5, 1.5, 1.5);
            bag.position.set(0, -0.5, 0);
            
            // 원본 재질 저장
            bag.traverse((child) => {
                if (child.isMesh) {
                    originalMaterials.set(child, child.material.clone());
                    child.castShadow = true;
                    child.receiveShadow = true;
                    console.log('메시 발견:', child.name);
                }
            });
            
            scene.add(bag);
            console.log('3D 모델이 성공적으로 로드되었습니다.');
            isLoading = false;
        },
        function (xhr) {
            const progress = (xhr.loaded / xhr.total * 100);
            console.log(progress.toFixed(1) + '% 로드됨');
        },
        function (error) {
            console.error('3D 모델 로드 중 오류 발생:', error);
            console.log('대체 모델을 생성합니다.');
            createFallbackModel();
            isLoading = false;
        }
    );
}

// 대체 모델 생성 (오류 발생 시)
function createFallbackModel() {
    console.log('대체 모델을 생성합니다.');
    createBagModel();
}

// 기본 가방 모델 생성 (간단한 형태)
function createBagModel() {
    const bagGroup = new THREE.Group();

    // 가방 본체 (박스 형태)
    const bodyGeometry = new THREE.BoxGeometry(2, 2.5, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: currentColor,
        shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    bagGroup.add(body);

    // 가방 핸들
    const handleGeometry = new THREE.TorusGeometry(0.8, 0.1, 8, 16);
    const handleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 100
    });
    const handle1 = new THREE.Mesh(handleGeometry, handleMaterial);
    handle1.position.set(-0.5, 1.5, 0);
    handle1.rotation.z = Math.PI / 2;
    handle1.castShadow = true;
    bagGroup.add(handle1);

    const handle2 = new THREE.Mesh(handleGeometry, handleMaterial);
    handle2.position.set(0.5, 1.5, 0);
    handle2.rotation.z = Math.PI / 2;
    handle2.castShadow = true;
    bagGroup.add(handle2);

    // 가방 지퍼
    const zipperGeometry = new THREE.BoxGeometry(1.8, 0.05, 0.05);
    const zipperMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        shininess: 200
    });
    const zipper = new THREE.Mesh(zipperGeometry, zipperMaterial);
    zipper.position.set(0, 1.25, 0.51);
    zipper.castShadow = true;
    bagGroup.add(zipper);

    // 가방 포켓
    const pocketGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.05);
    const pocketMaterial = new THREE.MeshPhongMaterial({ 
        color: currentColor,
        shininess: 100
    });
    const pocket1 = new THREE.Mesh(pocketGeometry, pocketMaterial);
    pocket1.position.set(-0.5, 0.5, 0.51);
    pocket1.castShadow = true;
    bagGroup.add(pocket1);

    const pocket2 = new THREE.Mesh(pocketGeometry, pocketMaterial);
    pocket2.position.set(0.5, 0.5, 0.51);
    pocket2.castShadow = true;
    bagGroup.add(pocket2);

    bag = bagGroup;
    scene.add(bag);
}

// 가방 색상 변경
function changeBagColor(color) {
    currentColor = color;
    if (bag) {
        bag.traverse((child) => {
            if (child.isMesh && originalMaterials.has(child)) {
                // 원본 재질을 기반으로 새 재질 생성
                const originalMaterial = originalMaterials.get(child);
                const newMaterial = originalMaterial.clone();
                
                // 색상 변경
                if (newMaterial.color) {
                    newMaterial.color.set(color);
                }
                
                // 메탈릭 및 러프니스 조정
                if (newMaterial.metalness !== undefined) {
                    newMaterial.metalness = 0.1;
                }
                if (newMaterial.roughness !== undefined) {
                    newMaterial.roughness = 0.7;
                }
                
                child.material = newMaterial;
            }
        });
    }
}

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    if (bag) {
        bag.rotation.y += 0.005;
    }
    
    renderer.render(scene, camera);
}

// 윈도우 리사이즈 처리
function onWindowResize() {
    const container = document.getElementById('threejs-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// 인기상품 슬라이더 초기화
function initProductSlider() {
    renderProducts();
    setupSliderControls();
}

// 상품 렌더링
function renderProducts() {
    const slider = document.getElementById('productSlider');
    slider.innerHTML = '';
    
    const productsToShow = showingMore ? popularProducts : popularProducts.slice(0, 6);
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price}</p>
                <p class="product-description">${product.description}</p>
            </div>
        `;
        slider.appendChild(productCard);
    });
}

// 슬라이더 컨트롤 설정
function setupSliderControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const moreBtn = document.getElementById('moreBtn');
    const slider = document.getElementById('productSlider');
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const maxIndex = showingMore ? popularProducts.length - 3 : 3;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSliderPosition();
        }
    });
    
    moreBtn.addEventListener('click', () => {
        showingMore = !showingMore;
        moreBtn.textContent = showingMore ? '접기' : '더보기';
        currentIndex = 0;
        renderProducts();
        updateSliderPosition();
    });
}

// 슬라이더 위치 업데이트
function updateSliderPosition() {
    const slider = document.getElementById('productSlider');
    const offset = currentIndex * -320; // 300px + 20px gap
    slider.style.transform = `translateX(${offset}px)`;
}

// 색상 선택기 초기화
function initColorSelector() {
    const colorButtons = document.querySelectorAll('.color-btn');
    
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 활성 상태 제거
            colorButtons.forEach(b => b.classList.remove('active'));
            // 현재 버튼 활성화
            btn.classList.add('active');
            // 가방 색상 변경
            const color = btn.dataset.color;
            changeBagColor(color);
        });
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initProductSlider();
    initColorSelector();
});
