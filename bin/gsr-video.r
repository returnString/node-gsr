#!/usr/bin/env RScript
library(parallel)
library(iterators)
library(foreach)
library(doParallel)
library(proto)
library(argparse)

parser <- ArgumentParser()
parser$add_argument('input', help = 'input csv file')
parser$add_argument('output', help = 'output video file')
parser$add_argument('--fps', type = 'integer', default = 3, help = 'frames per second')
args <- parser$parse_args()

main <- function()
{
	fps <- args$fps
	input <- args$input
	output <- args$output

	data <- read.csv(input)
	data$offsetSeconds = data$offset / 1000

	duration <- max(data$offsetSeconds)
	frames <- floor(duration * fps)
	cores <- detectCores()
	message('Rendering ', frames, ' frames using ', cores, ' cores')

	cluster <- makeCluster(cores)
	registerDoParallel(cluster)

	frameDir <- tempdir()
	foreach(i = 1:frames, .packages = 'ggplot2') %dopar% {
		toRender <- subset(data, offset < i / fps * 1000)
		plot <- ggplot(toRender, aes(x = offsetSeconds, y = value)) +
			geom_line() +
			labs(x = 'Time (s)', y = 'GSR (microsiemens)') +
			ylim(c(0, ceiling(max(data$value)))) +
			xlim(c(0, duration))
		ggsave(paste0(frameDir, '/', i, '.jpg'), plot)
	}

	stopCluster(cluster)

	message('Rendering video from frames: ', output)
	system(paste0('ffmpeg.exe -v 1 -y -r ', fps, ' -i "', frameDir, '/%d.jpg" ', output))
}

dummy <- main()