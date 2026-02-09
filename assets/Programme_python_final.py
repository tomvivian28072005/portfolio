import matplotlib.pyplot as plt
import numpy as np

##constante
Masse_T = 6.0 * 10**24 #kg
R_T = 6400 #km
Moment_T = 6.4 * 10**22 #Am^2
mu_0 = 4*np.pi*10**-7 #H/m
G = 6.674*10**-11 #SI
p = 0.7 #SU, "ratio de désaturation"
masse_sat = 4 #kg, influence minime : considéré constant
Gammar_max = 1 * 10**-4 #Nm, jamais atteinte en pratique

######Choix initiaux
iota = np.pi/3   #0->pi/2 (rad)
alt = 400   #400->600 (km)

#Magnéto-coupleur
Moment_petit = 0.15 #Am^2
Moment_grand = 0.2 #Am^2

#Roue de réaction
    #petit
Sto_mom_petit = 3 * 10**-3 #Nms
w_sat_petit = 2*np.pi/60*10000 #rad/s
    #grand
Sto_mom_grand = 6 * 10**-3 #Nms
w_sat_grand = 2*np.pi/60*15000 #rad/s

##Pour un sytème précis
w_t0 = -w_sat_petit
w_fin = p * w_t0
Sto_mom = Sto_mom_petit
Mx_max, My_max = Moment_petit, Moment_petit

#calcul de certaines constantes
Irz = Sto_mom / np.abs(w_t0)
r = (alt + R_T) * 10**3
T = 2*np.pi*np.sqrt(r**3/(G*(Masse_T+masse_sat))) #s
omega = 2*np.pi/T

##Temps
durée = 600     #sec
nbpoint = 1200
delta_t = durée/nbpoint

######Choix initiaux
t0 = T/6   #0->T (sec)


t = np.linspace(t0, durée + t0, nbpoint)

##Fonction
#créer nos listes pour tracer les courbes
Gammar = [0]
Mx = [0]
My = [0]
wr = [w_t0]

#calcul de By et Bx à chaque instant

def By(instant) :
    return mu_0*Moment_T/(4*np.pi*r**3) * 2 * np.cos(omega*instant) * np.sin(iota)

def Bx(instant) :
    return mu_0*Moment_T/(4*np.pi*r**3) * np.sqrt(1 - (np.cos(omega*instant) * np.sin(iota))**2)

def couple_fournis_par_MC(By_k, Bx_k, Mx_k, My_k, signeBy_k, signeBx_k) :
    return  np.abs(signeBy_k * By_k * My_k - signeBx_k * Bx_k * Mx_k)

def calcul(t) :
    for k in range(nbpoint-1) :

        #calcul des termes à chaque instant
        By_k = By(t[k])
        Bx_k = Bx(t[k])
        signeBy_k = np.sign(By_k)
        signeBx_k = np.sign(Bx_k)
        signew = np.sign(w_t0)

        Couple_max_fournis_par_MC = couple_fournis_par_MC(By_k, Bx_k, Mx_max, My_max, signeBy_k, signeBx_k)

        if np.abs(wr[k]) >= np.abs(w_fin) :

            if np.abs(Couple_max_fournis_par_MC) <= np.abs(Gammar_max) :
                Gammar.append(- signew * Couple_max_fournis_par_MC)
                Mx.append(- (-1) * signew * signeBx_k * Mx_max)
                My.append(- signew * signeBy_k * My_max)


            else : #n'arrive jamais car le couple de la roue est largement > à celui des magnétocoupleurs
                None

            wr.append(wr[-1] + delta_t/Irz*Gammar[-1])

        else :
            Gammar.append(0)
            Mx.append(0)
            My.append(0)
            wr.append(wr[k])


calcul(t)

Gammar = np.array(Gammar) #pas utiliser
Mx = 1000*np.array(Mx)  #mAm^2
My = 1000*np.array(My)  #mAm^2
wr = np.array(wr) #rad/s


##graphe
plt.figure(figsize=(10, 6))
plt.plot(t, Mx, label='Mx', color='red')
plt.plot(t, My, label='My', color='orange')
plt.plot(t, wr, label='wr', color='black')
plt.title('Courbes des moments magnétiques Mx et My, et de la vitesse de rotation en fonction du temps')
plt.xlabel('Temps (s)')
plt.ylabel('Moment magnétique (mAm^2), Vitesse de rotation (rad/s)')
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.show()