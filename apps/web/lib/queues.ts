import { createQueue, lineArtQueueName, pdfQueueName } from '@family/core';

export const lineArtQueue = createQueue(lineArtQueueName);
export const pdfQueue = createQueue(pdfQueueName);
