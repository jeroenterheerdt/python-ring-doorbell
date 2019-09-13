import 'dotenv/config'
import { RingApi } from '../api'
import * as path from 'path'
import { cleanOutputDirectory, outputDirectory } from './util'

/**
 * This example streams to files, each with 10 seconds of video.
 * The output will be in output/part${part #}.mp4
 **/

async function example(myemail, mypassword,outputdir,duration) {
  const ringApi = new RingApi({
      // Replace with your ring email/password
      email: myemail,
      password: mypassword,
      // Refresh token is used when 2fa is on
      refreshToken: process.env.RING_REFRESH_TOKEN!,
      debug: true
    }),
    [camera] = await ringApi.getCameras()

  if (!camera) {
    console.log('No cameras found')
    return
  }

  //await cleanOutputDirectory()

  console.log('Starting Video...')
  const sipSession = await camera.streamVideo({
    // save video 10 second parts so the mp4s are playable and not corrupted:
    // https://superuser.com/questions/999400/how-to-use-ffmpeg-to-extract-live-stream-into-a-sequence-of-mp4
    output: [
      '-flags',
      '+global_header',
      '-f',
      'segment',
      '-segment_time',
      '10', // 10 seconds
      '-segment_format_options',
      'movflags=+faststart',
      '-reset_timestamps',
      '1',
      path.join(outputdir, 'part%d.mp4')
    ]
  })
  console.log('Video started, streaming to part files...')

  sipSession.onCallEnded.subscribe(() => {
    console.log('Call has ended')
    process.exit()
  })

  setTimeout(function() {
    console.log('Stopping call...')
    sipSession.stop()
  }, duration * 1000) // Stop after x minutes
}

// print process.argv
var args = process.argv.slice(2);
//email is args[0]
//password is args[1]
//outputdir is args[2]
//duration is args[3]
var email = args[0]
var password = args[1]
var outputdir = args[2]
var duration = args[3]
example(email, password, outputdir,duration)
