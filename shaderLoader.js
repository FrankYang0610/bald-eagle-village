class ShaderLoader {
  static loadText(url) {
    return fetch(url).then(function(res) {
      if (!res.ok) {
        throw new Error('Failed to load ' + url + ': ' + res.status + ' ' + res.statusText);
      }
      return res.text();
    });
  }

  static load(vertexUrl, fragmentUrl) {
    return Promise.all([
      ShaderLoader.loadText(vertexUrl),
      ShaderLoader.loadText(fragmentUrl)
    ]).then(function(results) {
      return {
        vertexSource: results[0],
        fragmentSource: results[1]
      };
    });
  }
}

export function loadShaderSources(vertexUrl, fragmentUrl) {
  return ShaderLoader.load(vertexUrl, fragmentUrl);
}


