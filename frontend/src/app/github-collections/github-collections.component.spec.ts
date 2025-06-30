import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GithubCollectionsComponent } from './github-collections.component';

describe('GithubCollectionsComponent', () => {
  let component: GithubCollectionsComponent;
  let fixture: ComponentFixture<GithubCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GithubCollectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GithubCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
