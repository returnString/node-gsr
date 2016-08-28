#!/usr/bin/env RScript
library(ggplot2)
library(proto)
library(argparse)

parser <- ArgumentParser()
parser$add_argument('input', help = 'input csv file')
parser$add_argument('output', help = 'output image file')
args <- parser$parse_args()

main <- function()
{
	data <- read.csv(args$input)
	plot <- ggplot(data, aes(x = offset / 1000, y = value)) +
		geom_line() +
		labs(x = 'Time (s)', y = 'GSR (microsiemens)') +
		ylim(c(0, ceiling(max(data$value))))

	ggsave(args$output, plot)
}

dummy <- main()