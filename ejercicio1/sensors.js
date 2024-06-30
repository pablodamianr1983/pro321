class Sensor {
    constructor(id, name, type, value, unit, updated_at) {
      this.id = id; 
      this.name = name;
      this.type = type; 
      this.value = value; 
      this.updated_at = new Date(updated_at); 
      this.unit = unit;
    }
  
    get updateValue() {
      return this.value; 
    }
  
    set updateValue(newValue) {
      this.value = newValue; 
    }
  }
  
  class SensorManager {
    constructor() {
      this.sensors = [];
    }
  
    async loadSensors(url) {
      try {
        const response = await fetch(url);
        const data = await response.json(); 
  
        for (let i = 0; i < data.length; i++) { 
          const sensor = new Sensor(
            data[i].id,
            data[i].name,
            data[i].type,
            data[i].value,
            data[i].unit,
            data[i].updated_at
          );
          this.sensors.push(sensor);
        }
  
        this.render();
      } catch (error) {
        console.log("Error:", error); 
      }
    }
  
    updateSensor(id) {
      const sensor = this.sensors.find((s) => s.id === id);
      if (sensor) {
        let newValue;
        switch (sensor.type) {
          case "temperature":
            newValue = (Math.random() * 80 - 30).toFixed(2);
            break;
          case "humidity":
            newValue = (Math.random() * 100).toFixed(2);
            break;
          case "pressure":
            newValue = (Math.random() * 80 + 960).toFixed(2);
            break;
          default:
            newValue = (Math.random() * 100).toFixed(2);
        }
        sensor.updateValue = newValue; 
        this.render();
      } else {
        console.error(`Sensor ID ${id} no encontrado`);
      }
    }
  
    render() {
      const container = document.getElementById("sensor-container");
      container.innerHTML = ""; 
  
      for (let i = 0; i < this.sensors.length; i++) { 
        const sensor = this.sensors[i];
  
        const sensorCard = document.createElement("div");
        sensorCard.classList.add("column", "is-one-third"); 
  
        sensorCard.innerHTML = `
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">${sensor.name}</p> 
            </header>
            <div class="card-content">
              <div class="content">
                <p><strong>Tipo:</strong> ${sensor.type}</p>
                <p><strong>Valor:</strong> ${sensor.value} ${sensor.unit}</p>
              </div>
              <time datetime="${sensor.updated_at}">Última actualización: ${sensor.updated_at}</time> 
            </div>
            <footer class="card-footer">
              <a href="#" class="card-footer-item update-button" data-id="${sensor.id}">Actualizar</a> 
            </footer>
          </div>
        `;
  
        container.appendChild(sensorCard);
  
        const updateButton = sensorCard.querySelector(".update-button");
        updateButton.addEventListener("click", () => {
          this.updateSensor(sensor.id);
        });
      }
    }
  }
  
  const monitor = new SensorManager();
  monitor.loadSensors("sensors.json"); 
  