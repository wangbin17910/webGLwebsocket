// 声明全局变量
var startTime	= Date.now();
var container;
//声明摄像头，场景，渲染器
var camera, scene, renderer;
var skyboxMesh,
lon = 0, isUserInteracting = false,//是否与用户交互，就是拖动画面
lat = 0,
phi = 0, theta = 0;

// 检测是否有动画函数，没有则根据浏览器添加对应的函数
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	} )();
}
//初始化	

function init() {
	// 检测是否支持webgl
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, mesh;

	//得到画布的父级元素
	container = document.getElementById( 'pano_container' );
	//初始化场景
	scene = new THREE.Scene();
	//初始化摄像头
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1100 );
	camera.target = new THREE.Vector3( 0, 0, 0 );
	scene.add( camera );
	//初始化物件，球体
	mesh = new THREE.Mesh( new THREE.SphereGeometry( 500, 60, 40 ), new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/11.jpg' ) } ) );
	mesh.scale.x = -1;
	scene.add( mesh );

	//渲染器
	var element = document.getElementById( 'panoBox' );
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize( element.clientWidth-20, element.clientHeight );

	container.appendChild( renderer.domElement );
	
	//为全景图添加鼠标事件
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
}

function animate() {
	// 渲染3d场景
	render();
	// 调用动画
	requestAnimationFrame( animate );
}

function render() {
	// 根据时间转移摄像头
	// var timer = - new Date().getTime() * 0.0002; 
	// camera.position.x = 1000 * Math.cos( timer );
	// camera.position.z = 1000 * Math.sin( timer );
	//由鼠标位移计算出摄像头的视角
	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = ( 90 - lat ) * Math.PI / 180;
	theta = lon * Math.PI / 180;

	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.y = 500 * Math.cos( phi );
	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

	camera.lookAt( camera.target );

	// 展示场景
	renderer.render( scene, camera );
}

//鼠标按下
function onDocumentMouseDown( event ) {
	isUserInteracting = true;

	//记录下此时的鼠标位置
	//鼠标指针向对于浏览器页面（或客户区）的水平坐标
	onPointerDownPointerX = event.clientX;
	//鼠标指针向对于浏览器页面（或客户区）的垂直坐标
	onPointerDownPointerY = event.clientY;

	//记录下相对于原点的位移
	onPointerDownLon = lon;
	onPointerDownLat = lat;
}

function onDocumentMouseMove( event ) {
	//只有在鼠标按下的时候才能移动画面
	if ( isUserInteracting ) {
	//移动鼠标时变化的位移量加上原来的位置
		lon = ( onPointerDownPointerX - event.clientX ) * 0.2 + onPointerDownLon;
		lat = ( onPointerDownPointerY - event.clientY ) * 0.2 + onPointerDownLat;
	}
}

//鼠标弹开
function onDocumentMouseUp( event ) {
	isUserInteracting = false;
}