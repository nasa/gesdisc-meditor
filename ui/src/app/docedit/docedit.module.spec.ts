import { DoceditModule } from './docedit.module';

describe('DoceditModule', () => {
  let doceditModule: DoceditModule;

  beforeEach(() => {
    doceditModule = new DoceditModule();
  });

  it('should create an instance', () => {
    expect(doceditModule).toBeTruthy();
  });
});
