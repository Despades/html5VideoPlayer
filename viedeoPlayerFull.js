/*Для инициализации вызываем videoPlayer.init(obj), где obj - объект,
содержащий следующие поля: 
                            1) container - строка, содержащая id dom-элемента в который отрендерится плеер;
                            2) poster - строка, содержащая путь до картинки-превью к видео;
                            3) source - массив объектов, содержащих информацию где хранится видео и о его разрешении
                            объект имеет вид    {
                                                    src: './path/to/file/',
                                                    res: разрешение видео (указывается число, например 360)
                                                }

ПРИМЕЧАНИЕ: наглядно смотрим на инициализацию в файле index.html
*/

const videoPlayer = (function(){

    function renderTemplate(objSources){
        //пути к первому видео и постеру
        let poster = objSources.poster;
        let videoSource = objSources.source[0].src;
        
        function renderItem(items){
            const fragment = document.createDocumentFragment();
            let elem;
            //нужно будет пропустить items через sort по полю item.res
            const sortedItems = items.sort((a, b) => a.res - b.res);

            sortedItems.forEach((item, i) => {
                if(i==0){
                    elem = `<option value=${item.src} selected>${item.res}</option>`;
                }else{
                    elem = `<option value=${item.src}>${item.res}</option>`;
                }
                fragment.appendChild(new DOMParser().parseFromString(elem, "text/html").getElementsByTagName('option')[0]);
            });
    
            return fragment;
    
        }
    
        const playerTemplate = `<div class='video-container'>
                                    <video src=${videoSource} poster=${poster} class='video-player' id='video-player' preload='metadata'></video>
                                    <div class='video-hud'>
                                        <div class='video-hud__element video-hud__action video-hud__action_play' id='video-hud__action'></div>
                                        <div class='video-hud__element video-hud__curr-time' id='video-hud__curr-time'>00:00</div>
                                        <progress value='0' max='100' class='video-hud__element video-hud__progress-bar' id='video-hud__progress-bar'></progress>
                                        <div class='video-hud__element video-hud__duration' id='video-hud__duration'>00:00</div>
                                        <div class='video-hud__element video-hud__mute video-hud__mute_false' id='video-hud__mute'></div>
                                        <input type='range' value='100' max='100' title='Громкость' class='video-hud__element video-hud__volume' id='video-hud__volume'>
                                        <select title='Скорость' class='video-hud__element video-hud__speed' id='video-hud__speed'>
                                            <option value='25'>x0.25</option>
                                            <option value='50'>x0.50</option>
                                            <option value='75'>x0.75</option>
                                            <option value='100' selected>x1.00</option>
                                            <option value='125'>x1.25</option>
                                            <option value='150'>x1.50</option>
                                            <option value='175'>x1.75</option>
                                            <option value='200'>x2.00</option>
                                        </select>
                                        <select title='разрешение' class='video-hud__element video-hud__resolution' id='video-hud__resolution'></select>
                                        <a class='video-hud__element video-hud__download' title='Скачать' href='./video/video.mp4' download></a>
                                        <div class='video-hud__element video-hud__mute video-hud__fullscreen' id='video-hud__fullscreen'>&#91;  &#93;</div>
                                    </div>
                                </div>`;
                        
        //получаем элемент, в который будем рендерить плеер
        const playerContainer = document.getElementById(objSources.container);
        playerContainer.innerHTML = playerTemplate;                            
        document.getElementById('video-hud__resolution').appendChild(renderItem(objSources.source));//добавление выбора разрешения видео
    }


    class VideoPlayer{
        constructor(){//source
          //this.container = document.getElementById(container);
          //this.template = template;
          //this.sourse = source;
          this.inteface = {
              buttons: {},
              timeElements: {}
          };
          this.videoPlayer = undefined;
          this.lastProgress = 0;//необходимая переменная, чтобы избежать ошибки videoPlayer.duraion = NaN при вызове метода load()
        }

        //вкл/выкл воспроизведение
        videoControl(e){
            if(document.fullscreenElement && e.type == 'click') return;
            if(this.videoPlayer.paused){
                this.videoPlayer.play();
                this.inteface.buttons.actionButton.setAttribute('class','video-hud__element video-hud__action video-hud__action_play');
            }else{
                this.videoPlayer.pause();
                this.inteface.buttons.actionButton.setAttribute('class','video-hud__element video-hud__action video-hud__action_pause');
            }
            
            if(this.inteface.timeElements.durationTime.innerHTML == '00:00'){
                this.inteface.timeElements.durationTime.innerHTML = this.videoTime(this.videoPlayer.duration); 
            }
        }

        //Рассчитываем время в секундах и минутах
        videoTime(time){
            time = Math.floor(time);//округляем значение и получаем полное число секунд
            let minutes = Math.floor(time / 60);
            let seconds = Math.floor(time - minutes * 60);
            let minutesVal = minutes;
            let secondsVal = seconds;
        
            if(minutes < 10){
                minutesVal = '0' + minutes;
            }
            if(seconds < 10){
                secondsVal = '0' + seconds;
            } 
            return minutesVal + ':' + secondsVal;
        }

        //Отображаем время воспроизведения
        videoProgress(e){
            //const fn = this;
            //if(e.target == this.inteface.buttons.resulutionSelect) return;
            //console.log(e.target);
            //console.log(this.videoPlayer.duration);
            const progress = (Math.floor(this.videoPlayer.currentTime) / ((Math.floor(this.videoPlayer.duration) || this.lastProgress) / 100));
            this.lastProgress = progress;
            this.inteface.timeElements.progressBar.value = progress;
            this.inteface.timeElements.currentTime.innerHTML = this.videoTime(this.videoPlayer.currentTime); 
        }

        //метод перематывания
        videoChangeTime(e){ 
            const mouseX = Math.floor(e.pageX - this.inteface.timeElements.progressBar.offsetLeft);
            const progress = mouseX / (this.inteface.timeElements.progressBar.offsetWidth / 100);
            this.videoPlayer.currentTime = this.videoPlayer.duration * (progress / 100);
        }

        videoChangeResolution(e){
            const videoSource = this.inteface.buttons.resulutionSelect.value;
            const currentTime = Math.floor(this.videoPlayer.currentTime);
            //const durationTime = this.videoPlayer.duration;

            this.videoPlayer.src = videoSource;
            this.videoPlayer.load();
            this.videoPlayer.currentTime = currentTime;
            this.videoPlayer.play();
        }

        //метод изменения громкости
        videoChangeVolume(e){
            if(e.target === this.inteface.buttons.volumeScale){
                let volume = this.inteface.buttons.volumeScale.value / 100;
                this.videoPlayer.volume = volume;
                e.stopPropagation();  
            }else{
                let value = this.videoPlayer.volume * 100;
                //console.log(this.inteface.buttons.volumeScale.value);
                this.inteface.buttons.volumeScale.value = String(value);
            } 

            
            if(this.videoPlayer.volume == 0){
                this.inteface.buttons.muteButton.setAttribute('class','video-hud__element video-hud__mute video-hud__mute_true');
            }else{
                this.inteface.buttons.muteButton.setAttribute('class','video-hud__element video-hud__mute video-hud__mute_false');
            } 
        }

        videoChangeVolumeTest(){
            console.log(this.videoPlayer.volume);
        }
        
        videoMute(){ //Убираем звук
            if(this.videoPlayer.volume == 0){
                this.videoPlayer.volume = this.inteface.buttons.volumeScale.value / 100;
                this.inteface.buttons.muteButton.setAttribute('class','video-hud__element video-hud__mute video-hud__mute_false');
            }else{
                this.videoPlayer.volume = 0;
                this.inteface.buttons.muteButton.setAttribute('class','video-hud__element video-hud__mute video-hud__mute_true');
            }
        }

        //Меняем скорость воспроизведения
        videoChangeSpeed(){
            let speed = this.inteface.buttons.speedSelect.value / 100;
            this.videoPlayer.playbackRate = speed;
        }

        init(){
            //подключение нашего html-шаблона плеера
            //this.container.innerHTML = this.template;//возможно стоит вынести из класса
            //инициализация плеера
            this.videoPlayer = document.getElementById('video-player');
            //инициализация интерфейса
            this.initInterface();
            //навешиваем обработчики событий
            this.initListener();
        }

        initInterface(){
            //инициализация элементов с данными о времени 
            this.inteface.timeElements.progressBar = document.getElementById('video-hud__progress-bar');//прогрессбар
            this.inteface.timeElements.currentTime = document.getElementById('video-hud__curr-time');//текущее время
            this.inteface.timeElements.durationTime = document.getElementById('video-hud__duration');//продолжительность ролика
        
            //инициализация кнопок управления плеером
            this.inteface.buttons.actionButton = document.getElementById('video-hud__action');//кнопка воспрооизведение/пауза
            this.inteface.buttons.muteButton = document.getElementById('video-hud__mute');//кнопка вкл/выкл звук
            this.inteface.buttons.volumeScale = document.getElementById('video-hud__volume');//ползунок регулировки громкости
            this.inteface.buttons.speedSelect = document.getElementById('video-hud__speed');//выбор скорости воспроизведения
            this.inteface.buttons.fullScreen = document.getElementById('video-hud__fullscreen');//кнопка разворота на полный экран
            this.inteface.buttons.resulutionSelect = document.getElementById('video-hud__resolution');//выбор разрешения видео
        }

        initListener(){//здесь будут задаваться настройки пользователя
            this.inteface.buttons.actionButton.addEventListener('click', (e) => this.videoControl(e));
            this.videoPlayer.addEventListener('click', (e) => this.videoControl(e));
            this.videoPlayer.addEventListener('timeupdate', (e) => this.videoProgress(e));//Отображение времени
            this.videoPlayer.addEventListener('volumechange', (e) => this.videoChangeVolume(e));
            this.inteface.timeElements.progressBar.addEventListener('click', (e) => this.videoChangeTime(e));//Перемотка
            this.inteface.buttons.muteButton.addEventListener('click', () => this.videoMute());
            this.inteface.buttons.volumeScale.addEventListener('change', (e) => this.videoChangeVolume(e));
            this.inteface.buttons.speedSelect.addEventListener('change', () => this.videoChangeSpeed());//скорость воспроизведения
            this.inteface.buttons.resulutionSelect.addEventListener('change', (e) => this.videoChangeResolution(e));//изменение разрешения    
            this.inteface.buttons.fullScreen.addEventListener('click', (e) => {//переход в полноэкранный режим
                //console.log(this);
                // игнорирование событий, которые произошли не на данной кнопке
                if(!e.target.classList.contains('video-hud__fullscreen')) return;
                // если элемент уже в полноэкранном режиме, выйти из него
                // В противном случае войти в полный экран
                if(document.fullscreenElement){
                    document.exitFullscreen();
                }else{
                    this.videoPlayer.requestFullscreen();
                }
            });
            document.addEventListener('keyup', (e) => {//обрабатываем выход из полного экрана по нажатию на esc
                //console.log(e.code);
                if(e.code === 'Escape' && document.fullscreenElement){
                    document.exitFullscreen();
                    //console.log('на эту кнопку произойдет закрытие');
                }else if(e.code === 'Space') this.videoControl(e);
            });
        }
      
    }

    const configuration = {
        init(obj){
            renderTemplate(obj)//рендер всего шаблона
            const player = new VideoPlayer();//инициализация видео-плеера
            player.init();
        }
    }
    //console.log(renderTemplate([360, 480, 720, 1080]));

    return configuration;
}());
