export const getColors = async imgUrl => {
  try {
    const blob = await fetch(imgUrl).then(res => res.blob());
    const file = new File([blob], 'dot.png', blob);

    const reader = new FileReader();

    reader.onload = e => {
      const preview = document.querySelector('#preview');
      preview && preview.setAttribute('src', e.target.result);

      const icon = document.querySelector('#icon');
      icon && icon.setAttribute('src', e.target.result);
    };

    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);
    // formData.append('config', JSON.stringify(config));
    formData.append(
      'config',
      JSON.stringify({
        algorithm: 'yiq',
        transparencyTreshold: 10,
        iterationCount: 3,
        minLuminance: 0.3,
        maxLuminance: 0.9,
        distanceThreshold: 20,
        minSaturation: 0.3
      })
    );

    const result = await fetch(`https://common-colors.herokuapp.com/api/upload`, {
      method: 'post',
      body: formData
    }).then(res => res.json());

    const { _colors, gradient } = result || {};

    console.log({ gradient });

    return gradient;
  } catch (error) {
    console.error('whoopsie', error);
    return ['#444', '#f0f'];
  }
};
