#!/usr/bin/env RScript
library(parallel)
library(iterators)
library(foreach)
library(doParallel)
library(proto)
library(argparse)

parser <- ArgumentParser()
parser$add_argument('input', help = 'input csv file')
parser$add_argument('gameplayInput', help = 'input gameplay video')
parser$add_argument('output', help = 'output video file')
parser$add_argument('--fps', type = 'integer', default = 3, help = 'frames per second')
parser$add_argument('--dpi', type = 'integer', default = 72, help = 'dpi for generated video frames')
parser$add_argument('--tempdir', help = 'working directory for intermediate files')
args <- parser$parse_args()

main <- function()
{
	fps <- args$fps
	input <- args$input
	gameplayInput <- args$gameplayInput
	output <- args$output
	dpi <- args$dpi
	frameDir <- if (is.null(args$tempdir)) tempdir() else args$tempdir

	videoAttrs <- system(paste0('ffprobe -v 1 -show_entries stream=width,height,r_frame_rate ',
		'-of default=noprint_wrappers=1:nokey=1 ', gameplayInput), intern = T)

	videoRes = as.integer(videoAttrs[1:2])
	videoSize = videoRes / dpi
	fpsTokens = as.integer(unlist(strsplit(videoAttrs[3], '/')[1]))
	gameplayFps <- fpsTokens[1] / fpsTokens[2]
	dar <- paste0(videoRes[1], '/', videoRes[2])

	message('Input gameplay runs at ', gameplayFps, ' FPS at ', videoRes[1], 'x', videoRes[2])

	data <- read.csv(input)
	data$offsetSeconds = data$offset / 1000

	duration <- max(data$offsetSeconds)
	frames <- floor(duration * fps)
	cores <- detectCores()
	message('Rendering ', frames, ' frames using ', cores, ' cores')

	cluster <- makeCluster(cores)
	registerDoParallel(cluster)

	foreach(i = 1:frames, .packages = 'ggplot2') %dopar% {
		toRender <- subset(data, offset < i / fps * 1000)
		plot <- ggplot(toRender, aes(x = offsetSeconds, y = value)) +
			geom_line() +
			labs(x = 'Time (s)', y = 'GSR (microsiemens)') +
			ylim(c(0, ceiling(max(data$value)))) +
			xlim(c(0, duration))
		ggsave(paste0(frameDir, '/', i, '.jpg'), plot,
			width = videoSize[1], height = videoSize[2], dpi = dpi)
	}

	stopCluster(cluster)

	fpsRatio <- gameplayFps / fps 
	tempVideoPath = paste0(frameDir, '/', 'frames.mp4')
	message('Rendering video from frames: ', tempVideoPath)
	system(paste0('ffmpeg -v 1 -y -r ', gameplayFps, ' -framerate ', fps,
		' -i "', frameDir, '/%d.jpg" ', ' -filter:v "setpts=', fpsRatio, '*PTS" ', tempVideoPath))

	message('Merging with gameplay')
	system(paste0('ffmpeg -v 1 -y -r ', gameplayFps, ' -i "', gameplayInput, '" -i "', tempVideoPath, '" ',
		' -filter_complex "[1:0]format=rgba[a];',
		'[0:0]setdar=', dar, ',format=yuva420p,colorchannelmixer=aa=0.8[b];',
		'[a][b]overlay=shortest=1"',
		' ', output))
}

dummy <- main()