# html5VideoPlayer
Простой html5-видеоплеер с базовым функционалом. Позволяет указать несколько вариантов видеофайлов с разным разрешением.

Для инициализации вызываем videoPlayer.init(obj), где obj - объект,
содержащий следующие поля: 
                          1) container - строка, содержащая id dom-элемента в который отрендерится плеер;
                          2) poster - строка, содержащая путь до картинки-превью к видео;
                          3) source - массив объектов, содержащих информацию где хранится видео и о его разрешении.
                          Объект имеет вид:    {
                                                  src: './path/to/file/',
                                                  res: разрешение видео (указывается число, например 360)
                                              }

ПРИМЕЧАНИЕ: наглядно смотрим на инициализацию в файле index.html
