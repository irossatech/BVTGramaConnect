# Telugu UI (web subset)

`telugu-ui-400/600/700.woff` are the mobile app's "Telugu UI" font (`BVT Mobile App/assets/fonts/TeluguUI-*.ttf`,
made by `tool/make_telugu_ui.py`: Noto Sans Telugu scaled to 88% with tighter line metrics), cut down to Telugu
characters only with fontTools:

```
python -m fontTools.subset TeluguUI-Regular.ttf --unicodes="U+0C00-0C7F,U+0964-0965,U+200C-200D,U+25CC" --layout-features='*' --flavor=woff --output-file=telugu-ui-400.woff
```

Noto Sans Telugu is Copyright 2022 The Noto Project Authors (https://github.com/notofonts/telugu) and licensed under
the SIL Open Font License 1.1 (https://openfontlicense.org).
