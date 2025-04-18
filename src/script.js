import * as THREE from 'three';
import init from './init';
import './style.css';
//import GLTFLoader from 'https://cdn.rawgit.com/mrdoob/three.js/r128/examples/js/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


function showStartScreen() {
	return new Promise((resolve) => {
	  const startScreen = document.getElementById('start-screen');
	  const startButton = document.getElementById('start-button');
  
	  startButton.addEventListener('click', () => {
		startScreen.style.display = 'none'; // Скрываем начальный экран
		resolve(); // Продолжаем выполнение
	  });
	});
  }
  
  (async function main() {
	await showStartScreen();
	console.log('Начинаем основной скрипт...');



let font;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let startTime = Date.now(); // Время старта в миллисекундах <button class="citation-flag" data-index="8">
//------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------ИМПОРТ--ТЕКСТУРЫ--ЛУНЫ------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------

const textureLoader = new THREE.TextureLoader();
//const texture = textureLoader.load('moon.png');
const texture = textureLoader.load(
    require('../src/tex.png') // Укажите относительный путь от JS-файла
  );
  const normal = textureLoader.load(
    require('../src/normal.png') // Укажите относительный путь от JS-файла
  );
  const height = textureLoader.load(
    require('../src/height.png') // Укажите относительный путь от JS-файла
  );
  const rough = textureLoader.load(
    require('../src/roughness.png') // Укажите относительный путь от JS-файла
  );
  const AO = textureLoader.load(
    require('../src/ambientocclusion.png') // Укажите относительный путь от JS-файла
  );
  



texture.repeat.set(2, 2);
normal.repeat.set(2, 2);
height.repeat.set(2, 2);
rough.repeat.set(2, 2);
AO.repeat.set(2, 2);

texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
//
normal.wrapS = THREE.RepeatWrapping;
normal.wrapT = THREE.RepeatWrapping;
//
height.wrapS = THREE.RepeatWrapping;
height.wrapT = THREE.RepeatWrapping;

rough.wrapS = THREE.RepeatWrapping;
rough.wrapT = THREE.RepeatWrapping;

AO.wrapS = THREE.RepeatWrapping;
AO.wrapT = THREE.RepeatWrapping;

const material = new THREE.MeshStandardMaterial({ 
    map: texture,
    normalMap: normal,
    displacementMap: height,
    roughnessMap: rough,
    aoMap: AO,
    aoMapIntensity: 1,
    displacementScale: 0.1
});

//---------------------------------------СОЗДАНИЕ--МОДУЛЕЙ--И--СВЕТА---------------------------------------------

const plane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), material);

const moonGeometry = new THREE.BoxGeometry(30, 1, 30)
const moonMaterial = new THREE.MeshLambertMaterial({ color: 'white' })
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(0, 0, 0);

plane.rotation.x = -2;
plane.position.y = 5.5;
scene.add(plane);

const startLanHeight = 100;
// Добавление лунного модуля
let lander = new THREE.Mesh
lander.position.set(0, startLanHeight, 0);

    

const rollGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const rollMaterial = new THREE.MeshLambertMaterial({ color: 'blue' })
const rollIndic = new THREE.Mesh(rollGeometry, rollMaterial );



//-------------------------------------ТАЙМЕР---ЛУННОГО---КОРОБЛЯ------------------------------------------------------------

// Добавьте в секцию переменных
let countdownTime = 40 * 60; // 40 минут в секундах
const timerSpeed = 10; // Ускорение 1:let timerGroup;

// В функции createTimer() замените создание текста:


//-------------------------------------ИМПОРТ---ЛУННОГО---КОРОБЛЯ------------------------------------------------------------
//let landerr;
const loader = new GLTFLoader();
loader.load('models/scene.glb', function(gltf) {
	lander=gltf.scene;
    scene.add(lander);
	lander.position.set(0, startLanHeight, 0);
	lander.rotation.set(0, 0, 1.2);
}, undefined, function(error) {
    consolex.error(error);
});

//Добавление света
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 3)
directionalLight.position.y = 10
directionalLight.position.z = 15
scene.add(directionalLight)

const directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, 1)
directionalLight2.position.y = 10
scene.add(directionalLight2)

const directionalLightCam = new THREE.AmbientLight(0x333333, 2);
//scene.add(directionalLightCam)

//-------------------------------------ПЕРЕМЕННЫЕ------------------------------------------------------------
// Настройки управления
let isThrusting = false;
let roll = 0; // Крен
let angularVelocity = 0; // Угловая скорость
let velocity = new THREE.Vector3(0, 0, 0); // Скорость модуля
//const gravity = new THREE.Vector3(0, -0.003, 0); // Сила притяжения Луны
const thrustForce = 0.0001; // Сила толкания
const damping = 0.98; // Коэффициент затухания
const rollDamping = 0.95; // Коэффициент затухания для крена
const rollForce = 0.02; // Сила поворота
let isMouseDown = false;
//let horizontalStick, verticalStick;
const stickDistance = 5; // Максимальное расстояние стика от центра
const maxSpeed = 0.05; // Максимальная скорость для моделирования

function calculateGravity(position) {
    const moonPosition = new THREE.Vector3(0, -70, -30); // Позиция Луны
    const distance = position.distanceTo(moonPosition);
    const gravityStrength = 0.5 / (distance * distance); // Настраиваемый коэффициент
    return new THREE.Vector3(0, -gravityStrength, 0);
}

const maxRollAngle = 6*Math.PI / 8; // Максимальный угол поворота

let speedX = 0.01; // Скорость по X
let speedY = 0;    // Скорость по Y
let isLanding = false;

let movingIndicatorSpeed = 0; // Начальная скорость

const targetPositionX = 0; // Целевая позиция (центральный индикатор)

//Позиция камеры



//---------------------------------------УПРАВЛЕНИЕ--С--ПОМОЩЬЮ--КЛАВИАТУРЫ---------------------------------------------

window.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp') {
        isThrusting = true;
    }
    if (event.key === 'ArrowLeft') {
        angularVelocity += rollForce;
    } else if (event.key === 'ArrowRight') {
        angularVelocity -= rollForce; 
    }
});

window.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowUp') {
        isThrusting = false;
    }
});

//---------------------------------------СОЗДАНИЕ--ПАНЕЛИ---------------------------------------------


let panelGroup = new THREE.Group();

let panelBase = new THREE.Mesh/*(
    new THREE.BoxGeometry(10, 0.1, 1.5),
    new THREE.MeshLambertMaterial({ color: 'grey' }));
    panelGroup.add(panelBase);*/

loader.load('models/PanelBase.glb', function(gltf2){
panelBase=gltf2.scene;
panelBase.scale.set(2.35, 2.35, 2.35);
panelBase.rotation.x = 1;
panelBase.rotation.z = -3.14;
panelGroup.add(panelBase);
    }, undefined, function(error) {
    consolex.error(error);
        });

/*loader.load('models/scene.glb', function(gltf) {
	//landerr=gltf.scene;
	//console.log(landerr);
	//scene.remove(lander);
	lander=gltf.scene;
    scene.add(lander);
	lander.position.set(0, 40, 0);
	lander.rotation.set(0, 0, 0);
}, undefined, function(error) {
    consolex.error(error);
});*/
//lander.position.set(0, 10, 0);



panelBase.position.copy(camera.position);
	panelBase.translateX(0);
	panelBase.translateY(0);
	panelBase.translateZ(0);
//scene.add(panelBase);


//------------------------------------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------СОЗДАНИЕ--ИНДИКАТОРОВ--------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------ВЕРТИКАЛЬНЫЙ--ИНДИКАТОР---------------------------------------------------------------------


// Индикатор вертикального положения
/*const createVerticalIndicator = () => {
    const baseGeometry = new THREE.BoxGeometry(0.5, 0.9, 0.05);

    


    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.8,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0, 0);
    base.rotation.set(-0.7, 0, 0);
    
    const stickGeometry = new THREE.BoxGeometry(0.47, 0.03, 0.1);
    const stickMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1,
    });
    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
	stick.position.set(0, 0, 0);
    base.add(stick);

	const staticStick = new THREE.Mesh(stickGeometry, stickMaterial);
	staticStick.position.set(0, 0, 0);
    base.add(staticStick);
    
    scene.add(base);

    //stick.position.copy(camera.position);
    base.position.copy(camera.position);
    base.translateZ(-3);
    base.translateX(3);
    base.translateY(-1);
    
    return { base, stick };
};*/

//const verticalIndicator = createVerticalIndicator();

// Индикатор крена

//panelGroup.add(verticalIndicator.base);
panelGroup.add(rollIndic);

rollIndic.translateX(-1.2);

    

	camera.position.z = -5;
    camera.position.x = -30;

const updateCamera = () => {
    //Обновление вертикального индикатора
	camera.position.x = lander.position.x -5;
    camera.position.z = lander.position.z -5;
	camera.position.y = lander.position.y + 10;

    //camera.rotation.x = -0.2;
    //camera.rotation.y = -1.9;
    //camera.rotation.z = -0.6;

    camera.lookAt(lander.position);

    // Фиксируем вектор "вверх" камеры (опционально)
    camera.up.set(0, 1, -0.4); // Стандартное направление вверх (ось Y)

    //camera.rotation.y = 0.1;

    
};

// Удалите старый код создания основы
// const baseGeometry = new THREE.BoxGeometry(...);
// const base = new THREE.Mesh(...);

// Добавьте в начало основного кода
let vertBase = new THREE.Mesh;
let vertStick = new THREE.Mesh;

// Добавьте загрузку 3D-модели основы
loader.load('models/vertBase.glb', (gltf) => {
    vertBase = gltf.scene;
    vertBase.scale.set(2.85, 2.85, 2.85); // Настройте масштаб
    vertBase.rotation.set(0, 0, 0); // Сохраните исходный поворот
    panelGroup.add(vertBase);
    
    // Позиционирование как у старой базы
    vertBase.position.copy(camera.position);
    vertBase.translateZ(-3);
    vertBase.translateX(3);
    vertBase.translateY(-1);
  });

  // Удалите старый код создания стика
// const stickGeometry = new THREE.BoxGeometry(...);
// const stick = new THREE.Mesh(...);

// Добавьте загрузку 3D-модели стика
loader.load('models/vertDyn.glb', (gltf) => {
    vertStick = gltf.scene;
    vertStick.scale.set(2.35, 2.35, 2.35); // Настройте масштаб
    vertStick.rotation.set(0, 0, 0);
    //vertStick.position.set(0, 0, 0); // Начальная позиция
  
    // Сохраняем ссылку для анимации
    //verticalIndicator.stick = vertStick;
    
    // Добавьте в ту же позицию, что и старый стик
    panelGroup.add(vertStick); // Предполагая, что основа называется 'base'
    //vertStick.rotation.set(1, 0, 0);
    vertBase.position.copy(camera.position);
    vertBase.translateZ(-3);
    vertBase.translateX(3);
    vertBase.translateY(-1);
  });


//-------------------------------------------------ИНДИКАТОР--ТОПЛИВА------------------------------------------------------------------------------

// Добавьте в раздел создания индикаторов
const createFuelIndicator = () => {
    const group = new THREE.Group();
    
    // Основной фон
    const bgGeometry = new THREE.BoxGeometry(2, 0.3, 0.3);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    
    // Индикатор уровня
    const barGeometry = new THREE.BoxGeometry(0.3, 0.25, 0.05);
    const barMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.z = 0.04;
    bar.position.y = 0.05;
    bar.position.x = 0.65;
    
    group.add(bg);
    group.add(bar);
    
    // Позиционирование
    //group.position.copy(camera.position);
    group.translateX(-0.8);
    group.translateY(0);
    group.translateZ(-0.6);
    
    return { group, bar };
};

// Добавьте в переменные
const fuelIndicator = createFuelIndicator();
panelGroup.add(fuelIndicator.group);

//---------------------------------------таймер------------------------------------------------

let timerGroup = new THREE.Group();
panelGroup.add(timerGroup);

function createTimer() {
    // Удаляем локальное объявление группы
    
    // Фон
    const background = new THREE.Mesh(
        new THREE.BoxGeometry(6, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
    );
    timerGroup.add(background); // Теперь используем глобальную группу

    // Создаем текстовые элементы
    const textMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    
    // Минуты
    const minutesGeometry = new TextGeometry("50", {
        font: font,
        size: 0.2,
        height: 0.1
    });
    const minutesText = new THREE.Mesh(minutesGeometry, textMaterial);
    minutesText.position.set(-1.2, 0, 0.1);
    timerGroup.add(minutesText);
    
    // Секунды
    const secondsGeometry = new TextGeometry("00", {
        font: font,
        size: 0.2,
        height: 0.1
    });
    const secondsText = new THREE.Mesh(secondsGeometry, textMaterial);
    secondsText.position.set(0.6, 0, 0.1);
    timerGroup.add(secondsText);
    
    // Двоеточие
    const separatorGeometry = new TextGeometry(":", {
        font: font,
        size: 0.2,
        height: 0.1
    });
    const separator = new THREE.Mesh(separatorGeometry, textMaterial);
    separator.position.set(0, 0, 0.1);
    timerGroup.add(separator);

    timerGroup.position.set(0, 1.0, -0.4);
    timerGroup.rotation.set(1, 0, 0);
}
const fontLoader = new FontLoader();
fontLoader.load(
    require('./Furore_Regular.json'), (loadedFont) => {
    font = loadedFont;
    createTimer();
});


//------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------СОЗДАНИЕ---СТИКОВ-------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------


function createStick(color, x, z) {
    const geometry = new THREE.CylinderGeometry(0.03, 0.03, 1, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        metalness: 1,
        roughness: 0.3,
    });
    const stick = new THREE.Mesh(geometry, material);
    stick.rotation.x = Math.PI / 12; // Поворачиваем цилиндр, чтобы он стоял
    stick.position.set(x, 1, z);
    return stick;
}


//horizontalStick = createStick(-stickDistance, 0);
//verticalStick = createStick(0, stickDistance-4);
let verticalStick = new THREE.Group;
let horizontalStick = new THREE.Group;

let stickRest = new THREE.Mesh;
let stickRot = new THREE.Mesh;

loader.load('models/stickRest.glb', function(gltf2){
    stickRest=gltf2.scene;
    stickRest.scale.set(2.35, 2.35, 2.35);
    verticalStick.add(stickRest);
    }, undefined, function(error) {
    consolex.error(error);
        });


        loader.load('models/stickRot.glb', function(gltf2){
            stickRot=gltf2.scene;
            stickRot.scale.set(2.35, 2.35, 2.35);
            }, undefined, function(error) {
            consolex.error(error);
                });
        


//panelGroup.add(horizontalStick);
//panelGroup.add(verticalStick);

scene.add(panelGroup);


horizontalStick.add(stickRest);

panelGroup.add(horizontalStick);
panelGroup.add(verticalStick);




//---------------------------------------СОЗДАНИЕ--КНОПКИ---------------------------------------------


  // Обработчики событий для управления стиками
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

//---------------------------------------ГОРИЗОНТАЛЬНЫЙ---ИНДИКАТОР--------------------------------------------

const createHorizontalIndicator = () => {
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);  // Основной цилиндр
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a, 
        roughness: 0.5, 
        metalness: 0.2 
    });
    const Hbase = new THREE.Mesh(baseGeometry, baseMaterial);
    Hbase.rotation.x = Math.PI / 2;  // Поворот для горизонтального расположения
    Hbase.position.set(-0.5, 0, 0.05);  // Позиционирование
	Hbase.rotation.set(-3.2, 0, 0);  // Позиционирование

    // Создание маленьких цилиндров
    const createIndicatorCylinder = (position, radius) => {
        const indicatorGeometry = new THREE.CylinderGeometry(0.04, radius, 0.2, 32);
        const indicatorMaterial = new THREE.MeshStandardMaterial({
            emissive: 0x00ff00, // Зеленый свет
            emissiveIntensity: 1,
            roughness: 0.3
        });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.set(position, -0.01, 0);
        return indicator;
    };

    // Центральный индикатор (зеленый)
    const centerIndicator = createIndicatorCylinder(0, 0.015);
    Hbase.add(centerIndicator);

    // Индикатор для отображения положения лунного корабля
    const movingIndicator = createIndicatorCylinder(-0.32, 0.04);
    Hbase.add(movingIndicator);

    panelGroup.add(Hbase);

    return { Hbase, movingIndicator };
};

const horizontalIndicator = createHorizontalIndicator();

//---------------------------------------ОБНОВЛЕНИЕ---ВЕРТИКАЛЬНОГО----ИНДИКАТОРА--------------------------------------------
const numHeights = 20;
const targetAltitude = 10;  // Целевая высота
const checkHeights = Array.from({ length: numHeights }, (_, i) => targetAltitude + (i - numHeights / 2) * 0.5); // Высоты для проверки

// Функция для вычисления отклонения по оси X
const calculateDeviation = (position) => {
    return Math.abs(position.x);
};


//---------------------------------------добавление---параметров--для--вертикальной--скорости--------------------------------------------
let refHorSpeed = 10;
let curHorSpeed = 10;
let refVertPos = 30;

//-------------------------------------------------------------------------------------------------------------------------------------------------------

const updateHorizontalIndicator = () => {

    const currentPosX = horizontalIndicator.movingIndicator.position.x;

    // Рассчитываем разницу между текущей и целевой позицией
    const difference = targetPositionX - currentPosX;


    const startY = startLanHeight; // Начальная высота
    const endY = 5.5; // Высота поверхности
    const currentY = lander.position.y;
    // Линейная интерполяция позиции индикатора
    const startPosition = -0.32; // Начальная позиция индикатора
    const endPosition = 0; // Целевая позиция (центр)
    
    if (currentY <= endY) {
        horizontalIndicator.movingIndicator.position.x = endPosition;
        return;
    }
     // Вычисляем прогресс (от 0 до 1)
     const progress = (currentY - endY) / (startY - endY);


    // Устанавливаем скорость (пропорциональную разнице), чтобы движение было плавным
    movingIndicatorSpeed += difference * 0.00000143;//145 // 0.05 — коэффициент плавности

    // Ограничиваем максимальную скорость
    movingIndicatorSpeed = Math.max(Math.min(movingIndicatorSpeed, 0.1), -0.1);

	//const newPosHoz = ((lander.position.y-5.5)/(40-5.5))*(0-(-0.32)-0.32);

	horizontalIndicator.movingIndicator.position.z = -lander.position.z / 25;

        // Обновляем позицию индикатора
        horizontalIndicator.movingIndicator.position.x = 
        startPosition + (endPosition - startPosition) * (1 - progress);

    // Обновляем позицию
	//horizontalIndicator.movingIndicator.position.x += movingIndicatorSpeed;




    // Если индикатор достиг целевой позиции (с учетом небольшого порога), останавливаем его
    if (Math.abs(difference) < 0.01) {
        movingIndicatorSpeed = 0; // Останавливаем движение
        horizontalIndicator.movingIndicator.position.x = targetPositionX; // Точно устанавливаем позицию
    }
};

	const startHeight = startLanHeight;
	const amountItr = 20;
	const itrStep = startHeight/amountItr;
	const heights = []; // Массив для хранения высот, на которых будут проверяться отклонения
	const deviations = []; // Массив для хранения отклонений по оси Z
	let threashhold = amountItr;
	for (let i = 0; i <= amountItr; i++) {
    heights.push(startHeight - itrStep * i);
	}


//Вычисление отклонений горизонтальным индикатором
const checkDeviation = (landerPosition) => {
    const horThreash = 2;
    let horDev = curHorSpeed - refHorSpeed;
	let curHeight = landerPosition.y;
	for(let i=0; i<heights.length; i++){
	let itrPos = i * amountItr;
	const threashMult = 10;
	if(Math.abs(curHeight - heights[i]) < 1){
		if(landerPosition.z > -threashhold/10 && landerPosition.z < threashhold/10 && horDev<horThreash){
			horizontalIndicator.movingIndicator.material.emissive.set(0x00ff00); // Зеленый
			//threashhold--;
		}else if((landerPosition.z > -threashhold/7 && landerPosition.z < -threashhold/10) || 
        (landerPosition.z < threashhold/7 && landerPosition.z > threashhold/10) || 
        (horDev>horThreash && horDev<horThreash*2)){
			horizontalIndicator.movingIndicator.material.emissive.set(0xffff00); // Желтый
			//console.log(landerPosition.z);
		}else if(landerPosition.z <= -threashhold/4 || landerPosition.z >= threashhold/4 || horDev>horThreash*2){
			horizontalIndicator.movingIndicator.material.emissive.set(0xff0000); // Красныйв
		}
		}
	}
	
	}

	function getReferenceAltitude(timeElapsed) {
		// Пример: линейное снижение на 0.5 метра в секунду
		const initialAltitude = startLanHeight; // Начальная высота в метрах
		const descentRate = 0.3; // Скорость снижения (м/с)
		const refPos = initialAltitude - descentRate * timeElapsed
		return refPos;
	  }

//---------------------------------------ОБНОВЛЕНИЕ---ИНДИКАТОРОВ---------------------------------------------

	horizontalStick.translateX(1.5);
	horizontalStick.translateY(-0.2);
	horizontalStick.translateZ(-0.1);

	verticalStick.translateX(-1.5);
	verticalStick.translateY(-0.2);
	verticalStick.translateZ(-0.1);



  const updateIndicators = () => {

	updateHorizontalIndicator();
    //Привязка приборной панели к камере
	panelGroup.position.copy(camera.position);
    panelGroup.rotation.y=-1.75;
    panelGroup.rotation.x=-0.4;
	panelGroup.translateX(0.015);
	panelGroup.translateY(-3);
	panelGroup.translateZ(0.24);

	directionalLightCam.position.copy(verticalStick.position);
	directionalLightCam.translateX(0);
	directionalLightCam.translateY(0);
	directionalLightCam.translateZ(2);
	
	const timeElapsed = (Date.now() - startTime) / 350;

	const newPosStick = lander.position.y - getReferenceAltitude(timeElapsed);

	//Обновление вертикального индикатора
    vertBase.position.set(0, 0, 0);
    vertStick.position.set(0, 0, 0);

    vertStick.rotation.set(-0.575, 0.066, 0);
    vertStick.translateZ(0.25);
    vertStick.translateX(0.66);
    vertStick.translateY(0.56);

    //vertStick.position.y = (newPosStick/100)+0.1;
    //vertStick.position.y = -2;
	vertBase.rotation.set(-0.575, 0.066, 0);
    vertBase.translateZ(0.25);
    vertBase.translateX(0.66);
    vertBase.translateY(0.56);

	/////

	let rollTempZ = lander.rotation.y;
	let rollTempY = lander.rotation.z;

	rollIndic.rotation.z=rollTempZ;
	rollIndic.rotation.x=rollTempY;

};

//---------------------------------------СОЗДАНИЕ--ФУНКЦИЙ--ДЛЯ--СТИКОВ---------------------------------------------


let isFuelStick = false;
//
let isMoveStickRight = false;
let isMoveStickLeft = false;
let isRotStickForward = false;
let isRotStickBack = false;

// Переменные для хранения состояния вращения
let isDraggingLeft = false;
let isDraggingRight = false;
const rotationSpeed = 0.005; // Скорость вращения

const stickRadius = 2.5; // Ограничение радиуса перемещения

let forFuel = 0;
let forwardBack = 0;
let leftRight = 0;

function onMouseMove(event) {
    // Если один из стиков зажат, вращаем его
    if (isDraggingLeft || isDraggingRight) {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;


        
        // Вычисляем вращение
        const angleX = mouseY * 2;
        const angleY = mouseX * 2;
        
        if (isDraggingLeft) {
            //verticalStick.rotation.x = (-angleX - 1) * 0.8;
            //verticalStick.rotation.z = (-angleY + 1.3) * 1.0;

            
            forwardBack = (-angleX - 1) * 0.8;
            leftRight = (-angleY + 1.3) * 1.0;

            //console.log(verticalStick.rotation.x);
            //console.log(verticalStick.rotation.z);
            
        }

        if (isDraggingRight) {
            //horizontalStick.rotation.x = -angleX - 1;
            forFuel = (-angleX - 1);

            console.log("---")
            //console.log(horizontalStick.rotation.x);
        }
    }

}



function onMouseDown(event) {
    // Убираем координаты мыши в диапазон от -1 до 1
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    

    // Проектируем мышь на 3D-сцену
    const mouseVector = new THREE.Vector2(mouseX, mouseY);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVector, camera);


    
    const intersects = raycaster.intersectObjects([verticalStick, horizontalStick], true);
    
    if (intersects.length > 0) {
        const intersectedStick = intersects[0].object;
        console.log("Кликнули по:", intersectedStick); // Лог объекта
        
        if (intersectedStick === verticalStick || verticalStick.children.includes(intersectedStick)) {
            isDraggingLeft = true;

            console.log("Вертикальный стик активен");
        } else if (intersectedStick === horizontalStick) {
            isDraggingRight = true;
            console.log("Горизонтальный стик активен");
        } 
    }
}

/*if(forFuel > 1){
    isFuelStick = true;

    isThrusting = true;

} else if(forwardBack < -0.1){
    isRotStickForward = true;
} else if(forwardBack > 0.65){
    isRotStickBack = true;
} else if (leftRight > 0.6){
    isMoveStickLeft = true;
} else if(leftRight < -0.05){
    isMoveStickRight = true;
}*/




function onMouseUp(event) {
    // Сбрасываем состояние вращения
    isDraggingLeft = false;
    isDraggingRight = false;

    isFuelStick = false;

    isRotStickForward = false;
    isRotStickBack = false;

    isMoveStickRight = false;
    isMoveStickLeft = false;
}

const moveSpeed = 0.05; // Скорость перемещения

/*timerGroup.translateY(0);
timerGroup.translateZ(0);
timerGroup.scale.set(50,50,50);*/

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------СОЗДАНИЕ--ЧАСТИЦ--ДЛЯ--ОСНОВНОГО--ДВИГАТЕЛЯ------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------

const particleGroup = new THREE.Group();
particleGroup.position.copy(lander.position);
particleGroup.rotation.copy(lander.rotation);
particleGroup.rotation.set(0, 0, 1.2);
particleGroup.translateY(-0.8);
scene.add(particleGroup);

// Генерируем частицы в форме конуса
const coneHeight = 1.5; // Высота конуса
const coneRadius = 0.3; // Радиус основания
const particleCount = 500;

const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);
const lifetimes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
    // Генерация позиций в форме конуса
    const theta = Math.random() * Math.PI * 2;
    const y = Math.random() * coneHeight;
    const radius = (coneRadius / coneHeight) * y;
    
    positions[i*3] = Math.cos(theta) * radius;
    positions[i*3+1] = y - coneHeight/2; // Смещаем вниз для центрирования
    positions[i*3+2] = Math.sin(theta) * radius;

    // Случайные скорости для движения вверх и в стороны
    velocities[i*3] = -((Math.random() - 0.5) * 0.1);
    velocities[i*3+1] = -(0.1 + Math.random() * 0.2);
    velocities[i*3+2] = -((Math.random() - 0.5) * 0.1);

    lifetimes[i] = 30 + Math.random() * 30; // Время жизни частиц
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
particlesGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8
});

const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
particleGroup.add(particleSystem);


//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------СОЗДАНИЕ--ЧАСТИЦ--ДЛЯ--ДВИГАТЕЛЕЙ--КОРРЕКЦИИ------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------

const particlesTexture = textureLoader.load(
    require('../src/particles.png') // Укажите относительный путь от JS-файла
  );

const particleCor1Group = new THREE.Group();
particleCor1Group.position.copy(lander.position);
particleCor1Group.rotation.copy(lander.rotation);
particleCor1Group.rotation.set(0, 0, 1.2);
particleCor1Group.translateY(1.85);
particleCor1Group.translateZ(0.3); //влево вправо
particleCor1Group.translateX(0.1);//вверх вниз
scene.add(particleCor1Group);

// Генерируем частицы в форме конуса
const coneCor1Height = 0.25; // Высота конуса
const coneCor1Radius = 0.05; // Радиус основания
const particleCor1Count = 500;

const particlesCor1Geometry = new THREE.BufferGeometry();
const positionsCor1 = new Float32Array(particleCor1Count * 3);
const velocitiesCor1 = new Float32Array(particleCor1Count * 3);
const lifetimesCor1 = new Float32Array(particleCor1Count);

for (let i = 0; i < particleCor1Count; i++) {
    // Генерация позиций в форме конуса [[4]]
    const theta = Math.random() * Math.PI * 2;
    const y = Math.random() * coneCor1Height;
    const radius = (coneCor1Radius / coneCor1Height) * y;
    
    positionsCor1[i*3] = Math.cos(theta) * radius;
    positionsCor1[i*3+1] = y - coneHeight/2; // Смещаем вниз для центрирования
    positionsCor1[i*3+2] = Math.sin(theta) * radius;

    // Случайные скорости для движения вверх и в стороны
    velocitiesCor1[i*3] = -((Math.random() - 0.5) * 0.1);
    velocitiesCor1[i*3+1] = -(0.1 + Math.random() * 0.2);
    velocitiesCor1[i*3+2] = -((Math.random() - 0.5) * 0.1);

    lifetimesCor1[i] = 30 + Math.random() * 30; // Время жизни частиц
}

particlesCor1Geometry.setAttribute('position', new THREE.BufferAttribute(positionsCor1, 3));
particlesCor1Geometry.setAttribute('velocity', new THREE.BufferAttribute(velocitiesCor1, 3));
particlesCor1Geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimesCor1, 1));

const particlesCor1Material = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8
});

particlesCor1Material.map = particlesTexture;

const particleCor1System = new THREE.Points(particlesCor1Geometry, particlesCor1Material);
particleCor1Group.add(particleCor1System);

/*const video = document.createElement('video');
video.src = 'video.mp4';
video.loop = true; // Зациклить видео
video.muted = true; // Без звука (или настройте по необходимости)

const videoTexture = new THREE.VideoTexture(video);
const videoMaterial = new THREE.MeshBasicMaterial({ map: texture });
const videoPlane = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), material);
scene.add(videoPlane);*/


//---------------------------------------ФИЛЬНАЛЬНАЯ--ФУНКЦИЯ---------------------------------------------

function animate() {



    requestAnimationFrame(animate);

    console.log(isDraggingLeft)

    if(forFuel > 1){
        isFuelStick = true;
        
        isThrusting = true;

        horizontalStick.clear();
        horizontalStick.add(stickRot);
    
    } else if(forwardBack < -0.1){
        isRotStickForward = true;
    } else if(forwardBack > 0.65){
        isRotStickBack = true;
    } else if (leftRight > 0.6){
        isMoveStickLeft = true;
    } else if(leftRight < -0.05){
        isMoveStickRight = true;
    }
    

    particleGroup.position.copy(lander.position);
    particleGroup.rotation.copy(lander.rotation);

    particleCor1Group.position.copy(lander.position);
    particleCor1Group.rotation.copy(lander.rotation);
    //particleCor1Group.rotation.set(0, 0, 1.2);
    particleCor1Group.translateY(1.85);
    particleCor1Group.translateZ(0.3); //влево вправо
    particleCor1Group.translateX(0.1);//вверх вниз

    //---------------------------------------просчёт--горизонтальной--скорости---------------------------------------------


    refHorSpeed-=0.005;

    /*if (lander.position.y >= 5.6 && !video.isPlaying) {
        video.play(); // Запуск воспроизведения
      }*/

    /*console.log(refHorSpeed);
    console.log(curHorSpeed);
    console.log("---------");
    console.log("---------");
    console.log(lander.position.y);*/
    const timeElapsed2 = 1 / ((Date.now() - startTime) / 8);
    //console.log(timeElapsed2);

    const gravity = calculateGravity(lander.position);
	velocity.add(gravity);

    

	if (!isLanding && lander.position.y>=refVertPos) {
        texture.offset.x += timeElapsed2/1;
        normal.offset.x += timeElapsed2/1;
        height.offset.x += timeElapsed2/1;
        rough.offset.x += timeElapsed2/1;
        AO.offset.x += timeElapsed2/1;
		// Движение по оси X
		//lander.position.x += speedX;
	
		// Движение по оси Y при повороте
		speedY = Math.sin(lander.rotation.y) * 0.05;
		//lander.position.z += verticalStick.rotation.z*0.02;
	
		// Проверка на посадку
		if (lander.position.y <= 5.6) {
		  isLanding = true;
		  speedX = 0;
		  speedY = 0;
		}
	  }


      


	checkDeviation(lander.position);
   //Добавление вертикальной скорости при нажатой кнопке
   if(isFuelStick && isDraggingRight && fuelIndicator.bar.position.x > -0.65 && lander.position.y>=refVertPos){
        curHorSpeed -= 0.01;
        fuelIndicator.bar.position.x -= 0.0005;
        //doBaseFire()
        particleGroup.scale.set(1,1,1);
        const positions = particlesGeometry.attributes.position.array;
        const velocities = particlesGeometry.attributes.velocity.array;
        const lifetimes = particlesGeometry.attributes.lifetime.array;
    
        for (let i = 0; i < particleCount; i++) {
            // Обновляем позиции с учетом скорости
            positions[i*3] += velocities[i*3];
            positions[i*3+1] += velocities[i*3+1];
            positions[i*3+2] += velocities[i*3+2];
            
            // Уменьшаем время жизни
            lifetimes[i] -= 1;
            
            // Сброс частицы при истечении времени жизни
            if (lifetimes[i] < 0) {
                const theta = Math.random() * Math.PI * 2;
                const y = Math.random() * coneHeight;
                const radius = (coneRadius / coneHeight) * y;
                
                positions[i*3] = Math.cos(theta) * radius;
                positions[i*3+1] = y - coneHeight/2;
                positions[i*3+2] = Math.sin(theta) * radius;
                
                velocities[i*3] = -((Math.random() - 0.5) * 0.1);
                velocities[i*3+1] = -(0.1 + Math.random() * 0.2);
                velocities[i*3+2] = -((Math.random() - 0.5) * 0.1);
                
                lifetimes[i] = 30 + Math.random() * 30;
            }
        }
    
        // Обновляем атрибуты
        particlesGeometry.attributes.position.needsUpdate = true;
        particlesGeometry.attributes.lifetime.needsUpdate = true;
        
        // Синхронизируем позицию группы с основным объектом
        particleGroup.position.copy(lander.position);
        particleGroup.rotation.copy(lander.rotation);
        //particleGroup.rotation.set(1, 0, 0);
        particleGroup.rotation.x = lander.rotation.x;
        particleGroup.rotation.y = lander.rotation.y;
        particleGroup.rotation.z = lander.rotation.z;

   }else if(isFuelStick && isDraggingRight && fuelIndicator.bar.position.x > -0.65 && lander.position.y<refVertPos){
    velocity.y += thrustForce;
    fuelIndicator.bar.position.x -= 0.0005;
    //doBaseFire()
    particleGroup.scale.set(1,1,1);
    const positions = particlesGeometry.attributes.position.array;
        const velocities = particlesGeometry.attributes.velocity.array;
        const lifetimes = particlesGeometry.attributes.lifetime.array;
    
        for (let i = 0; i < particleCount; i++) {
            // Обновляем позиции с учетом скорости
            positions[i*3] += velocities[i*3];
            positions[i*3+1] += velocities[i*3+1];
            positions[i*3+2] += velocities[i*3+2];
            
            // Уменьшаем время жизни
            lifetimes[i] -= 1;
            
            // Сброс частицы при истечении времени жизни
            if (lifetimes[i] < 0) {
                const theta = Math.random() * Math.PI * 2;
                const y = Math.random() * coneHeight;
                const radius = (coneRadius / coneHeight) * y;
                
                positions[i*3] = Math.cos(theta) * radius;
                positions[i*3+1] = y - coneHeight/2;
                positions[i*3+2] = Math.sin(theta) * radius;
                
                velocities[i*3] = (Math.random() - 0.5) * 0.1;
                velocities[i*3+1] = 0.1 + Math.random() * 0.2;
                velocities[i*3+2] = (Math.random() - 0.5) * 0.1;
                
                lifetimes[i] = 30 + Math.random() * 30;
            }
        }
    
        // Обновляем атрибуты
        particlesGeometry.attributes.position.needsUpdate = true;
        particlesGeometry.attributes.lifetime.needsUpdate = true;
        
        // Синхронизируем позицию группы с основным объектом
        particleGroup.position.copy(lander.position);
        particleGroup.rotation.copy(lander.rotation);
        //particleGroup.rotation.set(1, 0, 0);
        particleGroup.rotation.x = lander.rotation.x;
        particleGroup.rotation.y = lander.rotation.y;
        particleGroup.rotation.z = lander.rotation.z;
   }

   if(!isDraggingRight){
    particleGroup.scale.set(0,0,0);
   }

   if(!isDraggingLeft){
    particleCor1Group.scale.set(0,0,0);
   }

   //Изменение положения и поворот лунного корабля при помощи стиков
   lander.rotation.y = verticalStick.rotation.z*0.2;
   roll = verticalStick.rotation.x/620;
   lander.rotation.z += roll * 0.9;

   roll += angularVelocity;

//Включение частиц при использовании 
   if(isDraggingLeft && verticalStick.rotation.z<-0.2){

   particleCor1Group.scale.set(1,1,1);
        const positionsCor1 = particlesCor1Geometry.attributes.position.array;
        const velocitiesCor1 = particlesCor1Geometry.attributes.velocity.array;
        const lifetimesCor1 = particlesCor1Geometry.attributes.lifetime.array;
    
        for (let i = 0; i < particleCor1Count; i++) {
            positionsCor1[i*3] += velocitiesCor1[i*3];
            positionsCor1[i*3+1] += velocitiesCor1[i*3+1];
            positionsCor1[i*3+2] += velocitiesCor1[i*3+2];
            
            lifetimesCor1[i] -= 1;
            
            // Сброс частицы при истечении времени жизни
            if (lifetimesCor1[i] < 0) {
                const theta = Math.random() * Math.PI * 2;
                const y = Math.random() * coneCor1Height;
                const radius = (coneCor1Radius / coneCor1Height) * y;
                
                positionsCor1[i*3] = Math.cos(theta) * radius/5;
                positionsCor1[i*3+1] = y - coneCor1Height/20;
                positionsCor1[i*3+2] = Math.sin(theta) * radius/5;
                
                velocitiesCor1[i*3] = -((Math.random() - 0.5) * 0.1)/20;
                velocitiesCor1[i*3+1] = -(0.1 + Math.random() * 0.2)/20;
                velocitiesCor1[i*3+2] = -((Math.random() - 0.5) * 0.1)/20;
                
                lifetimesCor1[i] = 30 + Math.random() * 30;
            }
        }
    
        particlesCor1Geometry.attributes.position.needsUpdate = true;
        particlesCor1Geometry.attributes.lifetime.needsUpdate = true;
        
        particleCor1Group.position.copy(lander.position);
        particleCor1Group.rotation.copy(lander.rotation);
        particleCor1Group.translateY(1.15);
        particleCor1Group.translateZ(0.3); //влево вправо
        particleCor1Group.translateX(0.1);//вверх вниз
   }else if(isDraggingLeft && verticalStick.rotation.z > 0.2){
    particleCor1Group.scale.set(1,1,1);
    const positionsCor1 = particlesCor1Geometry.attributes.position.array;
    const velocitiesCor1 = particlesCor1Geometry.attributes.velocity.array;
    const lifetimesCor1 = particlesCor1Geometry.attributes.lifetime.array;

    for (let i = 0; i < particleCor1Count; i++) {
        positionsCor1[i*3] += velocitiesCor1[i*3];
        positionsCor1[i*3+1] += velocitiesCor1[i*3+1];
        positionsCor1[i*3+2] += velocitiesCor1[i*3+2];
        
        lifetimesCor1[i] -= 1;
        
        // Сброс частицы при истечении времени жизни
        if (lifetimesCor1[i] < 0) {
            const theta = Math.random() * Math.PI * 2;
            const y = Math.random() * coneCor1Height;
            const radius = (coneCor1Radius / coneCor1Height) * y;
            
            positionsCor1[i*3] = Math.cos(theta) * radius/5;
            positionsCor1[i*3+1] = y - coneCor1Height/20;
            positionsCor1[i*3+2] = Math.sin(theta) * radius/5;
            
            velocitiesCor1[i*3] = -((Math.random() - 0.5) * 0.1)/20;
            velocitiesCor1[i*3+1] = -(0.1 + Math.random() * 0.2)/20;
            velocitiesCor1[i*3+2] = -((Math.random() - 0.5) * 0.1)/20;
            
            lifetimesCor1[i] = 30 + Math.random() * 30;
        }
    }

    // Обновляем атрибуты
    particlesCor1Geometry.attributes.position.needsUpdate = true;
    particlesCor1Geometry.attributes.lifetime.needsUpdate = true;
    
    particleCor1Group.position.copy(lander.position);
    particleCor1Group.rotation.copy(lander.rotation);
    //particleCor1Group.rotation.set(0, 0, 1.2);
    particleCor1Group.translateY(1.15);
    particleCor1Group.translateZ(-0.3); //влево вправо
    particleCor1Group.translateX(0.1);//вверх вниз
   } else if(isDraggingLeft && verticalStick.rotation.x > 0) {
    particleCor1Group.scale.set(1,1,1);
        const positionsCor1 = particlesCor1Geometry.attributes.position.array;
        const velocitiesCor1 = particlesCor1Geometry.attributes.velocity.array;
        const lifetimesCor1 = particlesCor1Geometry.attributes.lifetime.array;
    
        for (let i = 0; i < particleCor1Count; i++) {
            // Обновляем позиции с учетом скорости
            positionsCor1[i*3] += velocitiesCor1[i*3];
            positionsCor1[i*3+1] += velocitiesCor1[i*3+1];
            positionsCor1[i*3+2] += velocitiesCor1[i*3+2];
            
            // Уменьшаем время жизни
            lifetimesCor1[i] -= 1;
            
            // Сброс частицы при истечении времени жизни
            if (lifetimesCor1[i] < 0) {
                const theta = Math.random() * Math.PI * 2;
                const y = Math.random() * coneCor1Height;
                const radius = (coneCor1Radius / coneCor1Height) * y;
                
                positionsCor1[i*3] = Math.cos(theta) * radius/5;
                positionsCor1[i*3+1] = y - coneCor1Height/20;
                positionsCor1[i*3+2] = Math.sin(theta) * radius/5;
                
                velocitiesCor1[i*3] = -((Math.random() - 0.5) * 0.1)/20;
                velocitiesCor1[i*3+1] = -(0.1 + Math.random() * 0.2)/20;
                velocitiesCor1[i*3+2] = -((Math.random() - 0.5) * 0.1)/20;
                
                lifetimesCor1[i] = 30 + Math.random() * 30;
            }
        }
    
        // Обновляем атрибуты
        particlesCor1Geometry.attributes.position.needsUpdate = true;
        particlesCor1Geometry.attributes.lifetime.needsUpdate = true;
        
        particleCor1Group.position.copy(lander.position);
        particleCor1Group.rotation.copy(lander.rotation);
        //particleCor1Group.rotation.set(0, 0, 1.2);
        particleCor1Group.translateY(1.15);
        particleCor1Group.translateZ(0); //влево вправо
        particleCor1Group.translateX(0.42);//вверх вниз

   }else if(verticalStick.rotation.x < 0){
    particleCor1Group.scale.set(1,1,1);
    const positionsCor1 = particlesCor1Geometry.attributes.position.array;
    const velocitiesCor1 = particlesCor1Geometry.attributes.velocity.array;
    const lifetimesCor1 = particlesCor1Geometry.attributes.lifetime.array;

    for (let i = 0; i < particleCor1Count; i++) {
        // Обновляем позиции с учетом скорости
        positionsCor1[i*3] += velocitiesCor1[i*3];
        positionsCor1[i*3+1] += velocitiesCor1[i*3+1];
        positionsCor1[i*3+2] += velocitiesCor1[i*3+2];
        
        // Уменьшаем время жизни
        lifetimesCor1[i] -= 1;
        
        // Сброс частицы при истечении времени жизни
        if (lifetimesCor1[i] < 0) {
            const theta = Math.random() * Math.PI * 2;
            const y = Math.random() * coneCor1Height;
            const radius = (coneCor1Radius / coneCor1Height) * y;
            
            positionsCor1[i*3] = Math.cos(theta) * radius/5;
            positionsCor1[i*3+1] = y - coneCor1Height/20;
            positionsCor1[i*3+2] = Math.sin(theta) * radius/5;
            
            velocitiesCor1[i*3] = -((Math.random() - 0.5) * 0.1)/20;
            velocitiesCor1[i*3+1] = -(0.1 + Math.random() * 0.2)/20;
            velocitiesCor1[i*3+2] = -((Math.random() - 0.5) * 0.1)/20;
            
            lifetimesCor1[i] = 30 + Math.random() * 30;
        }
    }

    // Обновляем атрибуты
    particlesCor1Geometry.attributes.position.needsUpdate = true;
    particlesCor1Geometry.attributes.lifetime.needsUpdate = true;
    
    particleCor1Group.position.copy(lander.position);
    particleCor1Group.rotation.copy(lander.rotation);
    //particleCor1Group.rotation.set(0, 0, 1.2);
    particleCor1Group.translateY(1.15);
    particleCor1Group.translateZ(0); //влево вправо
    particleCor1Group.translateX(-0.3);//вверх вниз
   }



    // Ограничение угла поворота
    if (roll > maxRollAngle) {
        roll = maxRollAngle;
        angularVelocity = 0; 
    } else if (roll < -maxRollAngle) {
        roll = -maxRollAngle; 
        angularVelocity = 0; 
    }

   //console.log(fuelIndicator.bar.position.x);
   // console.log(isThrusting);
    //Добавление вертикальной скорости на стрелочку вверх
    /*if (isThrusting && lander.position.y>=refVertPos) {
        fuelIndicator.bar.position.x -= 0.005;
    }else if(isThrusting && lander.position.y<refVertPos){
        velocity.y += thrustForce;
        fuelIndicator.bar.position.x -= 0.005;
    }*/

    
    lander.position.add(velocity);

    // Обработка столкновений с поверхностью Луны
    if (lander.position.y < 5.5) {
        lander.position.y = 5.5;
        velocity.y = 0;
    }
	

	updateCamera();
    updateIndicators();
	

    renderer.render(scene, camera);
}

if (countdownTime > 0) {
    const minutes = String(Math.floor(countdownTime / 60)).padStart(2, '0');
    const seconds = String(Math.floor(countdownTime % 60)).padStart(2, '0');
    
    // Исправленные индексы элементов
    const minutesMesh = timerGroup.children.find(child => child.name === 'minutes');
    const secondsMesh = timerGroup.children.find(child => child.name === 'seconds');
    
    if (minutesMesh && secondsMesh) {
        minutesMesh.geometry.dispose();
        minutesMesh.geometry = new TextGeometry(minutes, {
            font: font,
            size: 0.4,
            height: 0.1
        });
        
        secondsMesh.geometry.dispose();
        secondsMesh.geometry = new TextGeometry(seconds, {
            font: font,
            size: 0.4,
            height: 0.1
        });
    }
}


animate();

})();