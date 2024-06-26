import { Text, View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useEffect, useState } from "react";
import styles from "./SelectLocationForm.style";
import ReturnButton from "../../common/ReturnButton/ReturnButton";
import SolidColorButton from "../../common/SolidColorButton/SolidColorButton";
import ModalOneButton from "../../common/Modal_1Button/Modal_1Button";
import Select from "../../common/Select/Select";
import { getAllStates, getCitiesFromState } from "../../../src/services/geography";
import { supabase } from "../../../src/supabase";

import { COLORS } from "../../../constants/theme";
import { AuthContext } from "../../../src/providers/AuthProvider";
import { LocationContext } from "../../../src/providers/LocationProvider";

const SelectLocationForm = ({goBack=true}) => {
    const router = useRouter();
    const [estado, setEstado] = useState(null);
    const [estadoLabel, setEstadoLabel] = useState(null);
    const [estados, setEstados] = useState([{label: '', value: ''}]);
    const [municipioLabel, setMunicipioLabel] = useState(null);
    const [municipio, setMunicipio] = useState(null);
    const [municipios, setMunicipios] = useState([{label: '', value: ''}]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { session } = useContext(AuthContext)
    const { location,setLocation } = useContext(LocationContext);

    function fetchEstados() {
        getAllStates().then((res) => {
            setEstados(res.data.map((estado) => {
                return {label: estado.nombre, value: String(estado.id)}
            }));
        });
    }

    useEffect(() => {
        if (session !=null){
            fetchEstados()
        }
        
    }, [session]);

    
    function cargarMunicipios(id_estado) {
        getCitiesFromState(id_estado).then((res) => {
            setMunicipios(res.data.map((municipio) => {
                return {label: municipio.nombre, value: String(municipio.id)}
            }));
        });
    }

    async function guardarUbicacion() {
        try {
            await supabase
            .from('usuarios')
            .update({
                estado: estado,
                municipio: municipio
            })
            .eq('id', session.user.id)

            setLocation({estado:estadoLabel,municipio:municipioLabel});
            console.log('guardando ubi...')
        } catch (error) {
            console.log(error)
        }
        
    }

    const handlePress = async () => {
        console.log('???')
        if (estado && municipio) {
            await guardarUbicacion();
            router.replace("/events");
        } else {
            setIsModalVisible(true);
        }
    }

      return (
        <SafeAreaView style={styles.container}>
            {goBack &&
            <Stack.Screen
            options={{
                headerStyle: {backgroundColor: COLORS.white},
                headerShadowVisible: false,
                headerLeft: () => (
                    <ReturnButton/>
                ),
                headerTitle: "",
                headerShown: true
            }}
        />
            }
            
            <ScrollView style={styles.scrollView}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        ¿En donde quieres buscar eventos?
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>
                        Por favor ingresa la ubicación en donde quieres buscar eventos.
                    </Text>
                </View>
                <View style={styles.selectEstado}>
                    <Select
                        placeholder="Estado *"
                        data={estados}
                        labelField="label"
                        valueField="value"
                        onChange={(estado) => {
                            setEstadoLabel(estado.label);
                            setEstado(estado.value);
                            
                            cargarMunicipios(estado.value);
                        }}
                        value={estado}
                    />
                </View>
                <View style={styles.selectEstado}>
                        <Select
                            placeholder="Municipio *"
                            data={municipios}
                            labelField="label"
                            valueField="value"
                            onChange={(municipio) =>{ 
                                setMunicipioLabel(municipio.label);
                                setMunicipio(municipio.value)}}
                            value={municipio}
                        />
                </View>
                <View style={styles.buttonContainer}>
                    <SolidColorButton
                    text="Continuar"
                    handleNavigate={handlePress}
                    buttonColor={COLORS.purple}
                    textColor={COLORS.white}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={{color:COLORS.red}}>
                        *
                        <Text style={styles.text}>
                            Campos son obligatorios
                        </Text>
                    </Text>
                </View>
            </ScrollView>
            <ModalOneButton
                  isVisible={isModalVisible}
                  title="ola"
                  message="Por favor, llene los espacios necesarios."
                  buttonText="Cerrar"
                  onPress={() => { setIsModalVisible(false); } }
                  buttonColor={COLORS.white}
                  textColor={COLORS.lightOrange} exitButtonPress={undefined}            />
        </SafeAreaView>
)};

export default SelectLocationForm;

