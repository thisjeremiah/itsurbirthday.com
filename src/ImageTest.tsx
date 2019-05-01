import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import './ImageTest.css'

type Status = 'notloaded' | 'loading' | 'done'

export function ImageTest() {
  const { handleClassify, previewImageUrl, result } = useClassify()

  const status: Status = previewImageUrl
    ? !result
      ? 'loading'
      : 'done'
    : 'notloaded'

  const isRichelle =
    result && result.classify.records[0].best_label.name === 'Richelle Chen'

  const onDrop = React.useCallback(
    files => {
      handleClassify(files[0])
    },
    [handleClassify],
  )

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <div style={{ width: '100%', height: '100%' }} {...getRootProps()}>
      <h1>Richelle or not Richelle™</h1>
      <input {...getInputProps()} />
      <button>Upload Image</button>
      {(function() {
        switch (status) {
          case 'notloaded':
            return null
          case 'loading':
            return <p className="ImageTest-result">Hmm...</p>
          case 'done':
          default:
            return (
              <p className="ImageTest-result">
                {isRichelle ? 'Richelle' : 'Not Richelle'}
              </p>
            )
        }
      })()}
      <img
        alt=""
        style={{ maxWidth: '75vw', maxHeight: '50vh' }}
        src={previewImageUrl}
      />
    </div>
  )
}

function useClassify() {
  const [result, setResult] = React.useState<any>(null)
  const [previewImageUrl, setPreviewImageUrl] = React.useState('')

  const handleClassify = React.useCallback(async (file: File) => {
    // Reset result and preview image url
    setResult(null)
    setPreviewImageUrl('')

    const url: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        // @ts-ignore
        resolve(reader.result)
      }
      reader.readAsDataURL(file)
    })

    setPreviewImageUrl(url)

    const classifyBody: any = {}
    const records = [{ _base64: url }]
    classifyBody.task_id = 'fcbe6a80-50f0-4006-b6a0-b8144e539afe'
    classifyBody.records = records
    const classifyResult = await (await fetch(
      'https://api.ximilar.com/recognition/v2/classify',
      {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: 'Token 9d7f909f1f21c519146b54af58e5bf5d0f3b214b',
        }),
        body: JSON.stringify(classifyBody),
      },
    )).json()

    // TODO Get approved
    // const tagBody: any = {
    // lang: 'en',
    // tagging_mode: 'complex',
    // records,
    // }

    // const tagResult = await (await fetch(
    // 'https://api.ximilar.com/tagging/generic/v2/tags',
    // {
    // method: 'POST',
    // headers: new Headers({
    // 'Content-Type': 'application/json',
    // Authorization: 'Token 9d7f909f1f21c519146b54af58e5bf5d0f3b214b',
    // }),
    // body: JSON.stringify(classifyBody),
    // },
    // )).json()

    setResult({ classify: classifyResult, tag: null /* tagResult */ })
  }, [])

  return { handleClassify, result, previewImageUrl }
}
