# Datalogger

I singoli esperimenti sono collocati nella cartella devices, divisa in sottocartelle per ogni distributore e ogni distributore contiene le sotto cartelle relative agli esperimenti.

```
devices/
|_{producer}/
  |_{product1}/
  |_{product2}/
  .
  .
  .

```

Ogni apparato è definito da almeno 3 file
  * src/ui.html
  * src/renderer.js
  * config.yaml

## `ui.html`

L'interfaccia viene definita da un file ui.html che contiene i blocchi. Ogni blocco struttura

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
Il blocco è costituito da due parti, heading e body.
* heading contiene il titolo del blocco ed eventuali azioni che possono essere fatte su questo. Ogni azione è definita come `<li><a data-action=''></a></li>` con il nome dell'azione in data-action. Le azioni per ora definite sono
  * `plot` :  Viene aperto il grafico della serie storica delle misure relative al blocco, questa azione richiede un ulteriore parametro `data-plot=''` con il nome della variabile da graficare.
  * `collapse`: Collassa il blocco
  * `move`: Consente lo spostamento del blocco
* In body vengono definiti i contenuti del blocco, ovvero i valori che devono essere mostrati da esso. Ogni blocco può contenere più valori disposti nel modo definito dall'utente attraverso css (twitter bootstrap3 supportato). Ogni valore deve essere definito almeno come `<div data-measure=''></div>` con un possibile placeholder come contenuto del div. Il parametro data-measure indica il nome del valore che verrà riportato come contenuto durante l'esecuzione del programma.

La disposizione dei blocchi all'interno dell'interfaccia è definita da html e css classici. L'ultimo blocco html definito è
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
e conterrà tutti gli input definiti nel file config.yaml

## `config.yaml`
Il file `config.yaml` contiene le configurazioni di base dell'apparato. La struttura di default del file è:

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

* `product`: Contiene alcune informazioni di descrizione dell'apparato:
    * `manufacturer`: Il nome del produttore
    * `manufacturercode` : Il codice identificativo del produttore, nome della cartella all'interno di `devices/`
    * `name` : Il nome dell'apparato
    * `model`: Il codice identiticativo dell'apparato
    * `description`: Una breve descrizione dell'apparato
    * `image`: Eventuale immagine rappresentativa del prodotto.
* `manual`: Contiene le informazioni per consentire al programma di reperire il manuale del dispositivo se presente
  * `url` : Url https del pdf del manuale
  * `git` : Se il manuale è fornito da una repository git può essere indicato quale sia, in modo da ottenere sempre la versione più aggiornata dello stesso
    * `user`: Lo username git
    * `repo`: Il nome della repository git
    * `tag` : Il tag della release, si suggerisce di usare `latest` per ottenere sempre l'ultima versione
    * `filename`: Il nome del file del manuale
* `config`: I valori per la configurazione iniziale del dispositivo
  * `mathsheet`: Le equazioni che definiscono il modo in cui i valori nei blocchi vengono calcolati, è necessario mantenere `|` all'inizio della stringa e definire ogni equazione in una riga separata
  * `channels`: I canali di input del dispositivo, valori che verranno restituiti dall'usb. Ogni canale è definito da:
      * `name`: Il nome del canale
      * `code`: Il codice identificativo del canale
      * `gain`: Il gain iniziale del canale
      * `gainvalues`: Il vettore dei valori accettabili come gain
      * `description` : Una breve descrizione del canale se necessaria
  * `calibration`: Valori di calibrazione del dispositivo, struttura da definire
  * `inputs`: La descrizione degli input dell'apparato, Il contenuto di questo blocco sarà utilizzato dal file `renderer.js` per definire i contenuti del blocco input dell'interfaccia.
    * `name`: Il nome dell'input
    * `type`: Il tipo dell'input, sono validi tutti i tipi html5
    * `min` : Se presente un valore di minimo
    * `max` : Se presente un valore di massimo
    * `values` : Se necessario un insieme di valori possibili per l'input (es. se l'input è dropdown serve definire quali siano i valori possibili)
    * `step` : Se necessario il passo di incremento
    * `default` : Valore di default dell'input
    * `sendtohardware` : Variabile dicotomica, `true` se il valore deve essere inviato all'apparato, `false` se il suo valore è utilizzato per modifiche da parte del software

-------

Nel momento in cui il programma viene avviato l'utente sceglie il dispositivo da una lista di apparati suddivisi per produttore. Una volta selezionato questo viene costruita l'interfaccia importando tutti i file necessari dalla cartella del dispositivo. 
