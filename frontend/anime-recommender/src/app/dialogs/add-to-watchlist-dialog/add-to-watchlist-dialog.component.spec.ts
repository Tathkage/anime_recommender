import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToWatchlistDialogComponent } from './add-to-watchlist-dialog.component';

describe('AddToWatchlistDialogComponent', () => {
  let component: AddToWatchlistDialogComponent;
  let fixture: ComponentFixture<AddToWatchlistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToWatchlistDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddToWatchlistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
