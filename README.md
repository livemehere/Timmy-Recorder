# Timmy-Recorder

## obs-studio-node

- [docs](https://github.com/hrueger/obs-studio-node-docs/blob/main/docs/index.md);

```bash
"obs-studio-node": "https://s3-us-west-2.amazonaws.com/obsstudionodes3.streamlabs.com/osn-0.15.6-release-win64.tar.gz"
```

## 이슈 해결 모음

- `window_capture` 빈화면 문제 [이슈링크](https://github.com/stream-labs/obs-studio-node/issues/1104)

## Tips

- 빌드 결과가 이상해서 디버깅 하고 싶을 때는 `yarn build:no-pack` 과 `yarn preview` 를 활용하세요.

## References

- [requestVideoFrameCallback](https://wicg.github.io/video-rvfc/)
- [requestAnimationFrame-web.dev](https://web.dev/articles/requestvideoframecallback-rvfc?hl=ko)
