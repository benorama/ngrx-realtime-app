import { AngularRealtimeAppPage } from './app.po';

describe('angular-realtime-app App', () => {
  let page: AngularRealtimeAppPage;

  beforeEach(() => {
    page = new AngularRealtimeAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
