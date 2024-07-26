import ffmpegPath from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';

import ffmpeg from 'fluent-ffmpeg';
import { CreateBlankVideoParams } from '../../../typings/preload';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath!.replace('app.asar', 'app.asar.unpacked'));
ffmpeg.setFfprobePath(ffprobe.path!.replace('app.asar', 'app.asar.unpacked'));

/** example */
// const images = path.resolve(__dirname, '../images/image-%d.png');
// const videoPath = path.resolve(process.cwd(), 'out.mp4');
//
// imageToVideo({
//   imagePath: images,
//   outputPath: videoPath,
//   duration: 7,
//   fps: 30,
//   width: 1280,
//   height: 720
// })
//   .then(() => {
//     console.log('done');
//   })
//   .catch((e) => {
//     console.log(e);
//   });

interface ImageToVideoOptions {
  /** @example 'image-%03d.png' */
  imagePath: string;
  outputPath: string;
  /** @description input & output fps */
  fps: number;
  width: number;
  height: number;
}

/** @description 이미지 프레임을 모아 비디오 파일로 만듭니다. */
export function convertImageFramesToVideo({ imagePath, outputPath, fps, width, height }: ImageToVideoOptions) {
  return new Promise<string>((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .inputFPS(fps)
      .outputFPS(fps)
      .size(`${width}x${height}`)
      .videoCodec('libx264')
      .outputOptions(['-pix_fmt yuv420p'])
      .saveToFile(outputPath)
      .on('start', () => {
        console.log('start');
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('progress', (progress) => {
        console.log(progress);
      });
  });
}

export function getMetaData(filePath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

/**
 *
 * @param input path
 * @param output path
 * @param fps
 * @param duration seconds
 */
export async function createBlankVideo({ outputPath, filename, fps, duration, width, height }: CreateBlankVideoParams) {
  return new Promise<string>((resolve, reject) => {
    ffmpeg()
      .input(`color=c=black:s=${width}x${height}`)
      .duration(duration)
      .inputFPS(fps)
      .inputOptions('-f lavfi')
      .videoCodec('libx265')
      .saveToFile(path.resolve(outputPath, filename))
      .on('start', () => {
        console.log('start');
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('progress', (progress) => {
        console.log(progress);
      });
  });
}
