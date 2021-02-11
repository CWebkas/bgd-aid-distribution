import { Component, Input, Output,EventEmitter, OnInit, ViewEncapsulation, ViewChild, ElementRef} from '@angular/core';
import { FormBuilder, FormGroup,  Validators } from '@angular/forms';
import { Feature, FeatureCollection, Geometry, MultiPolygon } from 'geojson';
import * as L from 'leaflet';
import * as d3 from 'd3';



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {
  private map!: L.Map;
  private amenitiesLayer: L.LayerGroup<any> = L.layerGroup();
  private healthLocationsLayer: L.LayerGroup<any> = L.layerGroup();
  private legend = new L.Control({ position: "bottomleft" });
  //private info = new L.Control({ position: "bottomright"});
  private ctrl = new L.Control({ position: "topright" });
  private menu = new L.Control({ position: "topright" });
  private div: any;
  private layer: any;
  private clickr: boolean = false;
  private adminLevel: any;
  private unitInterest: any;
  private calculation:any;
  private formlat: any;
  private formlng: any;
  private popup = L.popup();
  private indexdict: any = {'pop_female': 'female individuals',
                            'population': 'individuals',
                            'pop_endangered_flooding': 'individuals endangered by flooding',
                            'pop_perbuild': 'individuals per building',
                            'tube': 'tubewells',
                            'tube_risk': 'contaminated tubewells',
                            'pop_endangered_tubewell': 'individuals endangered by contaminated tubewells',
                            'latr': 'latrines',
                            'bath': 'bathing facilities',
                            'nutr': 'nutrition facilities',
                            'wpro': 'women protection areas',
                            'heal': 'health facilities'};
  @ViewChild('overview') child!:ElementRef<HTMLButtonElement>;
  @ViewChild('points') child2!:ElementRef<HTMLButtonElement>;
  @ViewChild('overviewCamps') child3!:ElementRef<HTMLButtonElement>;
  @ViewChild('pointEntry') formChild!:ElementRef<HTMLButtonElement>;
  //private ctrl: any;




  private _amenities: {
    name: string;
    latitude: number;
    longitude: number;
  }[] = [];

  private _healthLocations: {
    name: string;
    latitude: number;
    longitude: number;
  }[] = [];



  get amenities(): { name: string; latitude: number; longitude: number }[] {
    return this._amenities;
  }

  get healthLocations(): { name: string; latitude: number; longitude: number }[] {
    return this._healthLocations;
  }

  @Output()
  locationAdded: EventEmitter<{
    adminLevel: string;
    unitName: string;
    unitInterest: string;
  }> = new EventEmitter<{ adminLevel: string; unitName: string; unitInterest: string}>();

  @Output()
  pointInfoAdded: EventEmitter<{
    latitude: number;
    longitude: number;
    amenity: string;
    sanitationScore: number;
    adminLevel: string; 
    unitInterest: string;
    unitName: string;


  }> = new EventEmitter<{ latitude: number; longitude: number; amenity: string; sanitationScore: number; adminLevel: string; 
    unitInterest: string; unitName: string; }>();

  @Input()
  set healthLocations(
    value: { name: string; latitude: number; longitude: number }[]
  ) {
    this._healthLocations = value;
    this.updateHealthLocationsLayer();
  }
  

  pointForm: FormGroup;

  constructor(fb: FormBuilder) {
    this.pointForm = fb.group({
      latitude: [],
      longitude: [],
      amenity: fb.control('pleasefindemeherre'),
      sanitationScore: fb.control(1),
      adminLevel: [],
      unitName: [],
      unitInterest:[]

    });
  }


  private updateHealthLocationsLayer() {
    if (!this.map) {
      return;
    }

    // remove old amenities
    this.map.removeLayer(this.healthLocationsLayer);
    //this.map.removeControl(this.ctrl)




    // create a marker for each supplied amenity
    const markers = this.healthLocations.map((a) =>
      L.marker([a.latitude, a.longitude]).bindPopup(a.name)
    );

    // create a new layer group and add it to the map
    this.healthLocationsLayer = L.layerGroup(markers);
    markers.forEach((m) => m.addTo(this.healthLocationsLayer));
    this.map.addLayer(this.healthLocationsLayer);
  }


 
  /**
   * Often divs and other HTML element are not available in the constructor. Thus we use onInit()
   */
  ngOnInit(): void {
    // some settings for a nice shadows, etc.
    const iconRetinaUrl = './assets/marker-icon-2x.png';
    const iconUrl = './assets/marker-icon.png';
    const shadowUrl = './assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [20, 40],
      iconAnchor: [20, 40],
      popupAnchor: [1, -40],
      tooltipAnchor: [16, -40],
      shadowSize: [40, 40],
    });

    L.Marker.prototype.options.icon = iconDefault;

    // basic setup, create a map in the div with the id "map"
    this.map = L.map('map').setView([21.05, 92.29], 11);

    // set a tilelayer, e.g. a world map in the background
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  /**
   * Add a marker at the specified position to the map.
   * If a name is provided, also include a popup when marker is clicked.
   * @param latitude
   * @param longitude
   * @param name
   */
  public addMarker(latitude: number, longitude: number, name?: string): void {
    const marker = L.marker([latitude, longitude]);

    if (name) {
      marker.bindPopup(name);
    }

    marker.addTo(this.map);
  }

  
  enableButton(){
    this.child.nativeElement.style.visibility = 'unset';
    if(this.unitInterest != 'individuals'&& this.unitInterest != 'families'){
    this.child2.nativeElement.style.visibility = 'unset';}
    
    
  }

  restoreOverview(){
    this.child.nativeElement.style.visibility = 'hidden';
    this.child2.nativeElement.style.visibility = 'hidden';
    this.clickr=false;
    this.map.setView([21.05, 92.29], 11)
    this.map.removeLayer(this.healthLocationsLayer);
    this.formChild.nativeElement.style.visibility = 'hidden';
    
    

  }

  flyer(){
    this.map.setView([21.1978, 92.15], 14);
    this.child.nativeElement.style.visibility = 'unset';
  }

  flyerCenter(){
    this.map.setView([21.12, 92.15], 13);
    this.child.nativeElement.style.visibility = 'unset';
  }

  flyerSouth(){
    this.map.setView([20.95, 92.25], 13);
    this.child.nativeElement.style.visibility = 'unset';
  }
  showLocations(info= { adminLevel: this.adminLevel, unitName: this.layer.feature.properties.name, unitInterest: this.unitInterest}): void{
    this.locationAdded.emit(info);
    this.popup.remove();
    
  }

  onPtSubmit(pointInfo: {latitude: number; longitude: number; amenity: string; sanitationScore: number; adminLevel: string; unitInterest: string; unitName: string;}): void {
    this.pointInfoAdded.emit(pointInfo);
    console.log(pointInfo.latitude);
    
    //L.marker(L.latLng(pointInfo.latitude, pointInfo.longitude)).addTo(this.healthLocations);
      


    //console.log(pointInfo);
  
}

  blocksView(){
    console.log('hi');
    
  }

  /**
 * Add a GeoJSON FeatureCollection to this map
 * @param latitude
 */
  public addGeoJSON(geojson: FeatureCollection, adminLevel: string, calculation: string, unitInterest: string): void {
    // find maximum numbars value in array

    


    this.unitInterest = unitInterest;
    this.adminLevel = adminLevel;
    this.calculation = calculation;

    
    
    let max = d3.max(
      geojson.features.map((f: Feature<Geometry, any>) => +f.properties.numbars)
    );
    // if max is undefined, enforce max = 1

    console.log(max);
    console.log('hi');




    if (!max) {
      max = 1;
    }

    const colorscale = d3
      .scaleSequential()
      .domain([0, max])
      .interpolator(d3.interpolateViridis);

    const numbars = geojson.features.map((f: Feature<Geometry, any>) => +f.properties.numbars)



    // Adjust the Infobox

    var geoJSON: any;

    this.ctrl.onAdd = () => {
      this.div = L.DomUtil.create('div', 'info');
      this.div.innerHTML += "Hover over the " + adminLevel + "s " + "to see the number of " + this.indexdict[unitInterest] + ".";
      L.DomEvent.disableClickPropagation(this.div);
      return this.div;
    }

    this.map.addControl(this.ctrl)

    const highlightFeature = (e: any) => {
      if (this.clickr != true) {
        geoJSON.resetStyle(e.target);

        this.layer = e.target;


        this.layer.setStyle({
          weight: 1,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.9
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          this.layer.bringToFront();

        }

        var calc

        if(calculation== 'n_'){
          calc = ' '
        }else if(calculation== 'pop_per'){
          calc = 'persons per '
        }else if(calculation == 'dist_'){
          calc = 'mean distance to the next '
        }


        this.div.innerHTML = adminLevel + " " + '<b>' + this.layer.feature.properties.name + '</b>' + " has " + '<b>' + this.layer.feature.properties.numbars + '</b>'+ " " + calc  + this.indexdict[unitInterest];
      }
    }

    const resetHighlight = (e: any) => {
      if (this.clickr != true) {
        geoJSON.resetStyle(e.target);
      }

    }



    //Adjust the legend

    this.legend.onAdd = function (numbars: any) {
      if (!max) {
        max = 1;
      }
      console.log(max);
      
      var div = L.DomUtil.create('div', 'legend')




      var indexdict: any = {'pop_female': 'female individuals',
      'population': 'individuals',
      'pop_endangered_flooding': 'endangered by flooding',
      'pop_perbuild': 'individuals per building',
      'tube': 'tubewells',
      'tube_risk': 'contaminated tubewells',
      'pop_endangered_tubewell': 'endangered by contamination',
      'latr': 'latrines',
      'bath': 'bathing facilities',
      'nutr': 'nutrition facilities',
      'wpro': 'women protection areas',
      'heal': 'health facilities'};

      var countdict: any = {'n_': 'count',
                            "dist_": "average distance to",
                            "pop_per": "persons per"}
      console.log(countdict[calculation]);
      


      if(max/8 < 1){
        var grades = [Math.round(max / 8),
        Math.round(max / (8 / 4)),
        Math.round(max)]
      }else{
        var grades = [0, 
          Math.round(max / 8),
          Math.round(max / (8 / 2)),
          Math.round(max / (8 / 3)),
          Math.round(max / (8 / 4)),
          Math.round(max / (8 / 5)),
          Math.round(max / (8 / 6)),
          Math.round(max / (8 / 7)), 
          Math.round(max)]
        };

      div.innerHTML += '<h4>' + countdict[calculation]+ " " + indexdict[unitInterest] + '</h4>';
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + colorscale(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };

    this.legend.addTo(this.map);


    // Click functionality
    //this.menu.onAdd =  ()=>{
      
      //var div = L.DomUtil.create('tmp');
      //div.innerHTML = '<button class="button" click=some() mat-stroked-button>Back to overview</button>'

      //return div;
      //div.addTo(this.map)


    //}







    const zoomToFeature = (e: any) => {
      if (this.clickr != true) {
        this.clickr = true;
        this.map.fitBounds(e.target.getBounds());
        this.layer = e.target;


        

        const onMapClick = (e:any)=>{
          this.popup
          .setLatLng(e.latlng)
          .setContent("Add a " +this.unitInterest+ " here by submitting the form below and updating the view.") 
          .openOn(this.map);
          this.pointForm.value.latitude = e.latlng.lat
          this.pointForm.value.longitude = e.latlng.lng
          this.pointForm.value.amenity = this.unitInterest
          this.pointForm.value.adminLevel = this.adminLevel
          this.pointForm.value.unitName = this.layer.feature.properties.name
          this.pointForm.value.unitInterest = this.unitInterest
          //console.log(this.unitInterest);
          
          this.formChild.nativeElement.style.visibility = 'unset';
          
          
        }

        this.map.on('click', onMapClick);
        



        this.layer.setStyle({
          weight: 3,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.3
        });
        this.enableButton();
      }
    }



    // each feature has a custom style
    const style = (feature: Feature<Geometry, any> | undefined) => {
      const numbars = feature?.properties?.numbars
        ? feature.properties.numbars
        : 0;

      return {
        fillColor: colorscale(numbars),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
      };
    };




    // each enable hover and click on layers
    const onEachFeature = (feature: Feature<Geometry, any>, layer: L.Layer) => {
      if (
        feature.properties &&
        feature.properties.name &&
        typeof feature.properties.numbars !== 'undefined'
      ) layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });




    };

    // create one geoJSON layer and add it to the map
    
    
    
    
    this.amenitiesLayer.removeFrom(this.map);
    
    
    geoJSON = L.geoJSON(geojson, {
      onEachFeature,
      style
    });

    this.amenitiesLayer = geoJSON

    this.amenitiesLayer.addTo(this.map);
    

    
    console.log(this.map);
    
  }
  some(): void {
    //this.pubsAdded.emit(true);
    console.log(this.map);

  }
}
