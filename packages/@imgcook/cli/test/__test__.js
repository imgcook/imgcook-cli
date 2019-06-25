const expect = require('chai').expect;

describe('lib/config.js', () => {
  const config = require('../lib/config');
  describe('config', () => {
    it('imgcook config', async () => {
      const result = await config('', {});
      expect(result).to.be.a('string');
    });

    it('imgcook config --set <path> <value>', async () => {
      expect(await config(12, { set: 'dslId' })).to.be.a('string');
    });

    it('imgcook config --remove <path> <value>', async () => {
      // expect(await config(12, { remove: 'dslId' })).to.be.a('string');
    });

    it('imgcook config --remove loaders @imgcook/cli-loader-images', async () => {
      // expect(await config(12, { remove: 'dslId' })).to.be.a('string');
    });

  });
});

describe('lib/pull.js', () => {
  const pull = require('../lib/pull');
  it('imgcook pull <moduleid> --path <path>', async () => {
    // expect(await config(12, { remove: 'dslId' })).to.be.a('string');
  });
});

describe('lib/install.js', () => {
  const install = require('../lib/install');
  it('imgcook install', async () => {
    // expect(await config(12, { remove: 'dslId' })).to.be.a('string');
  });
});