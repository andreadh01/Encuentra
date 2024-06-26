import React, { useEffect, useState, useRef } from "react";
import {Text, View,SafeAreaView, Animated, TouchableOpacity, ScrollView} from "react-native";
import MyCalendar from "../../common/Calendar/Calendar";
import ReturnButton from "../../common/ReturnButton/ReturnButton";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import styles from './FeatureEventTimeDate.style';
import TimePicker from "../../common/TimePicker/TimePicker";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import DesgloceCostos from "../../common/DesgloceCostosOpener/DesgloceCostosOpener";
import NavButton from "../../common/NavButton/NavButton";
import WarningIcon from "../../../assets/images/warningIcon.svg";
import { supabase } from "../../../src/supabase";


const FeatureEventTimeDate :React.FC = () => {
    //FORMATO DE FECHA DE EVENTO 2024-03-11 YYYY-MM-DD
    const UNSET_DATE = "YYYY-MM-DD";
    const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";
    const router = useRouter();
    const rangosFechasVacios = {
    "3meses":[],
    "2meses":[],
    "1mes":[],
    "3dias":[],
    "diaevento":[]
    }

    dayjs.extend(isBetween)
    const [firstDay, setFirstDay] = useState(UNSET_DATE);
    const [lastDay, setLastDay] = useState(UNSET_DATE);
    const [isDesgloceDiasActive, setIsDesgloceDiasActive] = useState(false)
    const [isDesgloceHorasActive, setIsDesgloceHorasActive] = useState(false)
    const [isDesgloceRangeActive,setIsDesgloceRangeActive] = useState(false);
    const [rangosFechasCobrados, setRangosFechasCobrados] = useState(rangosFechasVacios);
    const [rangosFechasActuales, setRangosFechasActuales] = useState(null)
    const [rangoOverlap, setRangoOverlap] = useState(null)
    const [isFlipped, setIsFlipped] = useState(false)
    const [isFlippedHours, setIsFlippedHours] = useState(false)
    const [isFlippedRange, setIsFlippedRange] = useState(false)
    const [startHour, setStartHour] = useState<Date>(null);
    const [endHour, setEndHour] = useState<Date>(null);
    const [validInputs, setValidInputs] = useState(false);
    const params = useLocalSearchParams();
    const event_date = String(params.fecha_inicio);
    const hora_inicio = String(params.hora);
    const id_evento = String(params.evento);

    useEffect(() => {
        getRangosDestacados()
    }, [])

    useEffect(() => {
        if (!(firstDay === UNSET_DATE) && !(lastDay === UNSET_DATE) && startHour!= null && endHour != null) setValidInputs(true)
        if ((firstDay === UNSET_DATE) || (lastDay === UNSET_DATE) || startHour === null || endHour === null) setValidInputs(false)
    },[firstDay,lastDay,startHour,endHour])

    useEffect(() => {
        if (!(firstDay === UNSET_DATE) && !(lastDay === UNSET_DATE)) {
            let rangosFechasCopy = {...rangosFechasVacios};
            let currentDay = dayjs(firstDay);
            let diaEvento = dayjs(event_date);
            let lastDayDate = dayjs(lastDay);
            while (currentDay <= lastDayDate) {
                let diferencia_meses = Math.ceil(diaEvento.diff(currentDay,'month',true));
                let diferencia_dias = diaEvento.diff(currentDay,'day',true);
                switch (true) {
                    case (diferencia_meses >= 3):
                        rangosFechasCopy["3meses"].push(currentDay.format(DISPLAY_DATE_FORMAT));
                        break;
                    case (diferencia_meses >= 2 && diferencia_meses < 3):
                        rangosFechasCopy["2meses"].push(currentDay.format(DISPLAY_DATE_FORMAT));
                        break;
                    case (diferencia_meses < 2 && diferencia_meses <= 1 && diferencia_dias > 3):
                        rangosFechasCopy["1mes"].push(currentDay.format(DISPLAY_DATE_FORMAT));
                        break;
                    case (diferencia_dias <= 3 && diferencia_dias != 0):
                        rangosFechasCopy["3dias"].push(currentDay.format(DISPLAY_DATE_FORMAT));
                        break;
                    case (diferencia_dias === 0):
                        rangosFechasCopy["diaevento"].push(currentDay.format(DISPLAY_DATE_FORMAT));
                        break;
                    default:
                        break;
                }
                currentDay = currentDay.add(1,'day')
            }
            let rangoFechas = {"fecha_inicio":firstDay,"fecha_final":lastDay}
            let overlap = getOverlap(rangoFechas,rangosFechasActuales)
            setRangoOverlap(overlap.rango)
            setRangosFechasCobrados(rangosFechasCopy)
        }

      }, [lastDay]);

      useEffect(() => {
        //console.log("rangoOverlap", rangoOverlap);
      }, [rangoOverlap]);


      function getOverlap(rangoNuevo: {}, rangosActuales: []) {
        let rangoNuevoInicio = dayjs(rangoNuevo["fecha_inicio"]);
        let rangoNuevoFinal = dayjs(rangoNuevo["fecha_final"]);
        let overlap = false;
        let rangoOverlap = null;
        rangosActuales.forEach(rango => {
            let rangoActualInicio = dayjs(rango["fecha_inicio"]);
            let rangoActualFinal = dayjs(rango["fecha_final"]);
            if (rangoNuevoInicio.isBetween(rangoActualInicio,rangoActualFinal,null,'[]') || rangoNuevoFinal.isBetween(rangoActualInicio,rangoActualFinal,null,'[]') || (rangoNuevoInicio.isBefore(rangoActualInicio) && rangoNuevoFinal.isAfter(rangoActualFinal))) {
                overlap=true;
                rangoOverlap=rango;
                
            }
        })
        return {overlap:overlap, rango:rangoOverlap};
      }

      useEffect(()=> {
        if (startHour != null && endHour != null) {
            if (dayjs(startHour).isAfter(dayjs(endHour))) {
                let temp = startHour;
                setStartHour(endHour);
                setEndHour(temp);
            }
        }

      }, [endHour])

      async function getRangosDestacados() {
        const {data, error} = await supabase.from("destacados").select("*").eq("id_evento",id_evento);
            if (error) {
                console.error('Error fetching events', error.message);
                return;
            } else {
                setRangosFechasActuales(data)
            }
        
      }


    
    return (
        <SafeAreaView style={styles.parentContainer}>
            <Stack.Screen
                options={{
                headerShown: true,
                headerStyle: {backgroundColor: "#FFFFFF"},
                headerShadowVisible: false,
                headerLeft: () => <ReturnButton />,
                headerTitle: ""
                }}
            />
            <ScrollView>
            <Text style={styles.title}>Elige un rango de fecha</Text>
                <View style={styles.calendarContainer}>
                    <MyCalendar fecha_inicio={event_date} onFirstDaySelect={setFirstDay} onLastDaySelect={setLastDay}/>
                </View>   
                <View style={styles.separator}/>
                <View>
                    {/* Esta es la estructura de las fechas*/}
                    <View style={styles.rangoFechaContainer}>
                        <View>
                            <Text style={styles.dateTimeButtonsLabel}>Desde</Text>
                            <Text style={styles.dateButton}>{firstDay === UNSET_DATE ? DISPLAY_DATE_FORMAT : dayjs(firstDay).format(DISPLAY_DATE_FORMAT)}</Text>
                        </View>
                        <View>
                            <Text style={styles.dateTimeButtonsLabel}>Hasta</Text>
                            <Text style={styles.dateButton}>{lastDay === UNSET_DATE ? DISPLAY_DATE_FORMAT : dayjs(lastDay).format(DISPLAY_DATE_FORMAT)}</Text>
                        </View>
                    </View>

                    {firstDay != "YYYY-MM-DD" && lastDay != "YYYY-MM-DD" &&
                        <Text style={styles.infoAnticipacion}>Tu programación tiene {dayjs(event_date).diff(dayjs(firstDay).format(UNSET_DATE),'day')} días de anticipación al evento.</Text>
                    }
                    
                    { firstDay != "YYYY-MM-DD" && lastDay != "YYYY-MM-DD" && 
                        <TouchableOpacity style={{paddingVertical:5}} onPress={() => {setIsDesgloceDiasActive(!isDesgloceDiasActive); setIsFlipped(!isFlipped)}}>
                            <DesgloceCostos isFlipped={isFlipped} text={"Desgloce de costos"}/>
                        </TouchableOpacity>
                    }

                    { isDesgloceDiasActive && firstDay != "YYYY-MM-DD" && lastDay != "YYYY-MM-DD" && 
                        <View>
                            { rangosFechasCobrados["3meses"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{rangosFechasCobrados["3meses"][0]} - {rangosFechasCobrados["3meses"][rangosFechasCobrados["3meses"].length-1]}</Text>
                                    <Text style={styles.rangosText}> $1.00/hora</Text>
                                </View>
                            }
                            { rangosFechasCobrados["2meses"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{rangosFechasCobrados["2meses"][0]} - {rangosFechasCobrados["2meses"][rangosFechasCobrados["2meses"].length-1]}</Text>
                                    <Text style={styles.rangosText}> $2.00/hora</Text>
                                </View>
                            }
                            { rangosFechasCobrados["1mes"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{rangosFechasCobrados["1mes"][0]} - {rangosFechasCobrados["1mes"][rangosFechasCobrados["1mes"].length-1]}</Text>
                                    <Text style={styles.rangosText}> $5.00/hora</Text>
                                </View>
                            }
                            { rangosFechasCobrados["3dias"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{rangosFechasCobrados["3dias"][0]} - {rangosFechasCobrados["3dias"][rangosFechasCobrados["3dias"].length-1]}</Text>
                                    <Text style={styles.rangosText}> $10.00/hora</Text>
                                </View>
                            }
                            { rangosFechasCobrados["diaevento"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{dayjs(event_date).format("DD/MM/YYYY")}</Text>
                                    <Text style={styles.rangosText}>$20.00/hora</Text>
                                </View>
                            }
                        </View>
                    }
                        
                        
                </View>

                <View style={styles.separator2}/>
                <Text style={styles.title}>Elige un rango de horas</Text>

                {/* Esta es la estructura de las horas */}
                <View style={styles.rangoHoraContainer}>
                    <View>
                        <Text style={styles.dateTimeButtonsLabel}>Desde</Text>
                        <TimePicker style={styles.timePicker} time={startHour} onChangeTime={setStartHour} label={""} minuteInterval={30}/>
                    </View>
                    <View >
                        <Text style={styles.dateTimeButtonsLabel}>Hasta</Text>
                        <TimePicker style={styles.timePicker} time={endHour} onChangeTime={setEndHour} label={""} minuteInterval={30}/>
                    </View>
                </View>

                <View style={styles.separator}/>
                { startHour!=null && endHour !=null &&
                    <View>
                        <Text style={styles.horasDiariasText}>{dayjs(endHour).diff(dayjs(startHour),'hour')} HORAS AL DÍA</Text>
                        { firstDay != "YYYY-MM-DD" && lastDay != "YYYY-MM-DD" && 
                            <TouchableOpacity style={{paddingVertical:5}} onPress={() => {setIsDesgloceHorasActive(!isDesgloceHorasActive); setIsFlippedHours(!isFlippedHours)}}>
                                <DesgloceCostos isFlipped={isFlippedHours} text={"Desgloce de costos"}/>
                            </TouchableOpacity>
                        }
                        { isDesgloceHorasActive && 
                        <View>
                            { rangosFechasCobrados["3meses"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{rangosFechasCobrados["3meses"][0]} - {rangosFechasCobrados["3meses"][rangosFechasCobrados["3meses"].length-1]}</Text>
                                    <Text style={styles.rangosText}> ${dayjs(endHour).diff(dayjs(startHour),'hour')}.00/día</Text>
                                </View>
                            }
                            { rangosFechasCobrados["2meses"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{rangosFechasCobrados["2meses"][0]} - {rangosFechasCobrados["2meses"][rangosFechasCobrados["2meses"].length-1]}</Text>
                                    <Text style={styles.rangosText}> ${dayjs(endHour).diff(dayjs(startHour),'hour')*2}.00/día</Text>
                                </View>
                            }
                            { rangosFechasCobrados["1mes"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{rangosFechasCobrados["1mes"][0]} - {rangosFechasCobrados["1mes"][rangosFechasCobrados["1mes"].length-1]}</Text>
                                    <Text style={styles.rangosText}> ${dayjs(endHour).diff(dayjs(startHour),'hour')*5}.00/día</Text>
                                </View>
                            }
                            { rangosFechasCobrados["3dias"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{rangosFechasCobrados["3dias"][0]} - {rangosFechasCobrados["3dias"][rangosFechasCobrados["3dias"].length-1]}</Text>
                                    <Text style={styles.rangosText}> ${dayjs(endHour).diff(dayjs(startHour),'hour')*10}.00/día</Text>
                                </View>
                            }
                            { rangosFechasCobrados["diaevento"].length > 0 &&
                                <View style={styles.rangosDiasContainer}>
                                    <Text style={styles.rangosText}>{dayjs(event_date).format("DD/MM/YYYY")}</Text>
                                    <Text style={styles.rangosText}>${dayjs(endHour).diff(dayjs(startHour),'hour')*20}.00/día</Text>
                                </View>
                            }
                        </View>
                    }
                    </View>
                }
                <Text style={styles.footerText}>Tu evento se verá en la sección de destacados en los rangos de fecha y hora que ingresaste</Text>
                { rangosFechasActuales != null && rangosFechasActuales.length > 0 && 
                    <View>
                        <TouchableOpacity style={{paddingVertical:5, justifyContent:'center', alignItems:'center'}} onPress={() => {setIsDesgloceRangeActive(!isDesgloceRangeActive); setIsFlippedRange(!isFlippedRange)}}>
                            <DesgloceCostos isFlipped={isFlippedRange} text={"Tu evento está destacado en estas fechas:"}/>
                        </TouchableOpacity>
                        {isDesgloceRangeActive && 
                            <View>
                            {rangosFechasActuales.map((rango, index) => {
                                
                                    let fecha_inicio = dayjs(rango["fecha_inicio"]).format("DD/MM/YYYY");
                                    let fecha_final = dayjs(rango["fecha_final"]).format("DD/MM/YYYY");
                                    let date = new Date(`2024-03-11T${rango["hora_inicio"]}`);
                                    let hora_inicial = date.toLocaleString('es', { hour: 'numeric', minute: 'numeric', hour12: true });
                                    date = new Date(`2024-03-11T${rango["hora_final"]}`);
                                    let hora_fin = date.toLocaleString('es', { hour: 'numeric', minute: 'numeric', hour12: true });
                                    
                                    return (
                                    <View style={styles.rangosDiasContainer}>
                                        <Text key={"fecha"+index} style={styles.rangosText}>{fecha_inicio} a {fecha_final}</Text>
                                        <Text key={"hora"+index} style={styles.rangosText}>{hora_inicial} a {hora_fin}</Text>
                                    </View>
                                    );
                                    })  }
                            </View>
                        }
                        
                    </View>
                }

                {rangoOverlap != null &&
                    <View style={styles.containerContainer}>
                        <View style={styles.yellowContainer}>
                        </View>
                        <View style={styles.empalmeContainer}>
                            <WarningIcon/>
                            <Text style={styles.warningText}> Tu evento ya está destacado entre estas fechas:</Text>
                            <Text style={styles.warningText}> {dayjs(rangoOverlap["fecha_inicio"]).format("DD/MM/YYYY")} a {dayjs(rangoOverlap["fecha_final"]).format("DD/MM/YYYY")} </Text>
                        </View>
                    </View>
                    
                    
                }
                
                { validInputs &&
                    <View style={styles.nextButtonContainer}>
                        <NavButton type={"next"} handlePress={() => router.push({pathname:"events/checkout", params:{
                            id:id_evento,
                            startDay:firstDay,
                            endDay:lastDay,
                            firstHour:startHour,
                            lastHour:endHour,
                            eventStartHour:hora_inicio,
                            eventStartDate:event_date,
                            rangosFechasCobrados:JSON.stringify(rangosFechasCobrados)
                        }})}/>
                    </View>
                }
                { !validInputs && 
                    <View style={styles.nextButtonContainer}>
                        <NavButton type={"invalid"} handlePress={() => console.log("perro baboso")}/>
                    </View>
                }
                
                
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelText}> Cancelar </Text>
                </TouchableOpacity>
                </ScrollView>
        </SafeAreaView>
    );
}

export default FeatureEventTimeDate