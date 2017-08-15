# Datalogger


The single experiments can be found in the "devices" folder, grouped by subfolders for any manufacturer.

```
devices/
|_{producer}/
  |_{product1}/
  |_{product2}/
  .
  .
  .

```

Every scientific instrument needs at least three files:
  * src/ui.html
  * src/renderer.js
  * config.yaml

## `ui.html`


The UI is defined by a file `ui.html` that contains various blocks. Each block has a structure similar to this:

 ```html
 <div class='panel panel-flat' >
   <div class='panel-heading'>
     <h5 class='panel-title'></h5>
     <div class='heading-elements'>
       <ul class='icons-list'>
       </ul>
     </div>
   </div>
   <div class='panel-body big-text text-center'>
   </div>
 </div>
 ```
 
The block has two parts, heading and body.

* The heading contains the title of the block as well as any action that can be done on it. The actions are defined with `<li><a data-action=''></a></li>` where "data-action" is the name of the action. For now, the following actions are defined
  * `plot` :  Opens another electron BrowserWindow with  time-series plot of the data. This also requires the parameter `data-plot=''` with the name of the variable to graph.
  * `collapse`: Collapses the block
  * `move`: allows to drag and drop the block
* In the body all contens of the block are defined, mostly the values the block needs to display. Any value should be defined at least with `<div data-measure=''></div>` with possibly as placeholder as the div content. The parameter "data-measure" indicates the name of the mathematical variable that will be written inside the widget during the software's execution.

### Input blocks

The last html block defined is the input block:

```html
<div class='panel panel-flat'>
  <div class='panel-heading'>
    <h5 class='panel-title'>Inputs</h5>
    <div class='heading-elements'>
      <ul class='icons-list'>
        <li><a data-action='collapse'></a></li>
      </ul>
    </div>
  </div>
  <div class='panel-body'>
    <form class='form-horizontal' id='input-form'>
    </form>

  </div>
</div>
```
It is automatically populated from the parameters found in the config.yaml file.

## `config.yaml`
The file `config.yaml` contains the configuration parameters for each device. Every file has the same structure

```yaml
product:
  manufacturer:
  manufacturercode :
  name:
  model:
  description:
  image:
manual:
  url:
  git:
    user:
    repo:
    tag:
    filename:
config:
  mathsheet: |
  channels:
      - name:
        code:
        gain:
        gainvalues:
        description:
  calibration:
  inputs :
      - name:
        type:
        min:
        max:
        values:
        step:
        default:
        sendtohardware :

```

* `product`: Contains the description of the instrument
    * `manufacturer`: The manufactuer name
    * `manufacturercode` : an product-unique code, (generally the warehouse SKU), must be the same as the name of the directory inside `devices/`
    * `name` : The device's name
    * `model`: The model code of the device.
    * `description`: Short device description. No marketing wank.
    * `image`: path to a picture of the instrument.
* `manual`: Contains where to find the muser manual, if it exists
  * `url` : HTTPS:// url of the manual
  * `git` : If the manual can be found as a GitHub release in a GitHub repository it can be indicated here.
    * `user`: GitHub user or organization
    * `repo`: GitHub repo
    * `tag` : GitHub release tag. Generally `latest` is fine for most uses.
    * `filename`: The name of the asset in the release
* `config`: Initial configuration values of the device.
  * `mathsheet`: The list of equations, written in [mathjs](http://mathjs.org/) language, that defines the data processed by the application. The symbol `|` must be prepended since this is a multi-line string. Comments can be written using `#` at the start of the line.
  * `channels`: The output channels of the USB device. Please see [data-chan](https://github.com/neroreflex/data-chan) [docs](https://neroreflex.github.io/data-chan/). Each channel is defined by:
      * `name`: The arbitrary channel name.
      * `code`: Unique data-chan code of the channel (0x00 to 0xFF).
      * `gain`: Initial gain to be set-up.
      * `gainvalues`: An array of acceptable gains. "gain" will be threated as the index of the array "gainvalues"
      * `description` : A short description of the channel, such as "measured voltage on the probe"
  * `calibration`: Calibration values of the device, Structure still to be defined.
  * `inputs`: The descriptions of the device inputs that will be used by `renderer.js` to define the input blocks in the interface. 
    * `name`: The input name.
    * `type`: The html5 type of the input.
    * `min` : if present, a minimun value
    * `max` : if present, a maximun value.
    * `values` : if present,  list of defined values for the input, to be used for example in a dropdown menu.
    * `step` : if present, the step of increment
    * `default` : Default value of the input
    * `sendtohardware` : boolean: `true` if the value needs to be sent to the apparatus `false` if the value is used internally by the software

-------
