import { Component, Inject, OnInit } from '@angular/core';
import { facetLoad, SearchFacetFilterComponent } from '../search-facet-filter/search-facet-filter.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  VocabularyEntryDetail
} from '../../../../../core/submission/vocabularies/models/vocabulary-entry-detail.model';
import { SearchService } from '../../../../../core/shared/search/search.service';
import {
  FILTER_CONFIG,
  IN_PLACE_SEARCH,
  REFRESH_FILTER,
  SearchFilterService
} from '../../../../../core/shared/search/search-filter.service';
import { Router } from '@angular/router';
import { RemoteDataBuildService } from '../../../../../core/cache/builders/remote-data-build.service';
import { SearchConfigurationService } from '../../../../../core/shared/search/search-configuration.service';
import { SearchFilterConfig } from '../../../models/search-filter-config.model';
import { FacetValue } from '../../../models/facet-value.model';
import { addOperatorToFilterValue, getFacetValueForType } from '../../../search.utils';
import { filter, map, take } from 'rxjs/operators';
import { VocabularyService } from '../../../../../core/submission/vocabularies/vocabulary.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { PageInfo } from '../../../../../core/shared/page-info.model';
import { environment } from '../../../../../../environments/environment';
import {
  VocabularyTreeviewModalComponent
} from '../../../../form/vocabulary-treeview-modal/vocabulary-treeview-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import {
  FilterInputSuggestionsComponent
} from '../../../../input-suggestions/filter-suggestions/filter-input-suggestions.component';
import {
  SearchFacetOptionComponent
} from '../search-facet-filter-options/search-facet-option/search-facet-option.component';
import {
  SearchFacetSelectedOptionComponent
} from '../search-facet-filter-options/search-facet-selected-option/search-facet-selected-option.component';
import { AsyncPipe, LowerCasePipe, NgFor, NgIf } from '@angular/common';
import { SEARCH_CONFIG_SERVICE } from '../../../../../my-dspace-page/my-dspace-configuration.service';

@Component({
    selector: 'ds-search-hierarchy-filter',
    styleUrls: ['./search-hierarchy-filter.component.scss'],
    templateUrl: './search-hierarchy-filter.component.html',
    animations: [facetLoad],
    standalone: true,
    imports: [NgFor, SearchFacetSelectedOptionComponent, SearchFacetOptionComponent, NgIf, FilterInputSuggestionsComponent, FormsModule, AsyncPipe, LowerCasePipe, TranslateModule]
})

/**
 * Component that represents a hierarchy facet for a specific filter configuration
 */
export class SearchHierarchyFilterComponent extends SearchFacetFilterComponent implements OnInit {

  constructor(protected searchService: SearchService,
              protected filterService: SearchFilterService,
              protected rdbs: RemoteDataBuildService,
              protected router: Router,
              protected modalService: NgbModal,
              protected vocabularyService: VocabularyService,
              @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService,
              @Inject(IN_PLACE_SEARCH) public inPlaceSearch: boolean,
              @Inject(FILTER_CONFIG) public filterConfig: SearchFilterConfig,
              @Inject(REFRESH_FILTER) public refreshFilters: BehaviorSubject<boolean>
  ) {
    super(searchService, filterService, rdbs, router, searchConfigService, inPlaceSearch, filterConfig, refreshFilters);
  }

  vocabularyExists$: Observable<boolean>;

  /**
   * Submits a new active custom value to the filter from the input field
   * Overwritten method from parent component, adds the "query" operator to the received data before passing it on
   * @param data The string from the input field
   */
  onSubmit(data: any) {
    super.onSubmit(addOperatorToFilterValue(data, 'query'));
  }

  ngOnInit() {
    super.ngOnInit();
    this.vocabularyExists$ = this.vocabularyService.searchTopEntries(
      this.getVocabularyEntry(), new PageInfo(), true, false,
    ).pipe(
      filter(rd => rd.hasCompleted),
      take(1),
      map(rd => {
        return rd.hasSucceeded;
      }),
    );
  }

  /**
   * Open the vocabulary tree modal popup.
   * When an entry is selected, add the filter query to the search options.
   */
  showVocabularyTree() {
    const modalRef: NgbModalRef = this.modalService.open(VocabularyTreeviewModalComponent, {
      size: 'lg',
      windowClass: 'treeview'
    });
    modalRef.componentInstance.vocabularyOptions = {
      name: this.getVocabularyEntry(),
      closed: true
    };
    modalRef.result.then((detail: VocabularyEntryDetail) => {
      this.selectedValues$
        .pipe(take(1))
        .subscribe((selectedValues) => {
          this.router.navigate(
            [this.searchService.getSearchLink()],
            {
              queryParams: {
                [this.filterConfig.paramName]: [...selectedValues, {value: detail.value}]
                  .map((facetValue: FacetValue) => getFacetValueForType(facetValue, this.filterConfig)),
              },
              queryParamsHandling: 'merge',
            },
          );
        });
    }).catch();
  }

  /**
   * Returns the matching vocabulary entry for the given search filter.
   * These are configurable in the config file.
   */
  getVocabularyEntry() {
    const foundVocabularyConfig = environment.vocabularies.filter((v) => v.filter === this.filterConfig.name);
    if (foundVocabularyConfig.length > 0 && foundVocabularyConfig[0].enabled === true) {
      return foundVocabularyConfig[0].vocabulary;
    }
  }
}
