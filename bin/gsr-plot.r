#!/usr/bin/env RScript
library(ggplot2)

args <- commandArgs(trailingOnly = T)

main <- function()
{
	inputPath <- args[1]
	outputPath <- args[2]
	if (is.na(inputPath))
	{
		stop('Please specify a csv file')
	}

	if (is.na(outputPath))
	{
		stop('Please specify an output file')
	}

	data <- read.csv(inputPath)
	plot <- ggplot(data, aes(x = offset, y = value)) +
		geom_line() +
		labs(x = 'Time (ms)', y = 'GSR (microsiemens)')

	ggsave(outputPath, plot)
}

dummy <- main()