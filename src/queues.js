import PQueue from 'p-queue';

export const statesQueue = new PQueue({ concurrency: 1 });
export const pagesQueue = new PQueue({ concurrency: 30 });
